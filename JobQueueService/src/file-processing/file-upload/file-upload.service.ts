import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { JOB_QUEUE_STATUS, JOB_TYPE } from 'src/core/constants';
import { CustomException } from 'src/core/exception-handlers';
import { JobQueue } from 'src/entities/job_queue.entity';
import { JobQueueService } from 'src/job-queue/job-queue.service';
import { ProducerService } from 'src/kafka/producer/producer.service';
import { UserInputDTO } from 'src/models/user-input.model';
import { Repository } from 'typeorm';
import * as xlsx from 'xlsx';
import * as unzipper from 'unzipper';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(JobQueue)
    private readonly jobQueueRepository: Repository<JobQueue>,
    private readonly kafka: ProducerService,
    private readonly jobQueueService: JobQueueService,
    private readonly configService: ConfigService,
  ) {}

  handleFileUpload = async (message: string) => {
    const { fileName, filePath } = JSON.parse(message);
    const jobItem = await this.jobQueueService.createUploadJob(
      filePath,
      fileName,
      JOB_TYPE.UPLOADS,
    );
    const url = `${this.configService.get('USER_SERVICE_URL')!}/api/users/upload/${fileName}`;
    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const tmpFilePath = path.join(__dirname, 'uploads', fileName);
      fs.writeFileSync(tmpFilePath, response.data);
      Logger.debug(`File temporary saved to ${tmpFilePath}`);
      const records: UserInputDTO[] = await this.extractExcelContent(tmpFilePath);
      Logger.log('File deleted from temporary location');
      fs.unlinkSync(tmpFilePath);
      Logger.debug('Insert records to database');
      await this.insertBulkRecords(records);
      await this.notifyJobUpdate(jobItem, JOB_QUEUE_STATUS.SUCCESS);
    } catch (error) {
      Logger.error('Error processing user bulk upload: ', error);
      await this.notifyJobUpdate(jobItem, JOB_QUEUE_STATUS.FAILED);
    }
  };

  handleRetryJobQueueItem = async (message: string) => {
    const { jobId } = JSON.parse(message);
    try {
      const jobItem = await this.jobQueueRepository.findOneByOrFail({
        id: jobId,
      });
      const { fileName } = JSON.parse(jobItem.jobData);
      const url = `${this.configService.get('USER_SERVICE_URL')!}/api/users/upload/${fileName}`;
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const tmpFilePath = path.join(__dirname, 'uploads', fileName);
      fs.writeFileSync(tmpFilePath, response.data);
      Logger.debug(`File temporary saved to ${tmpFilePath}`);
      const records: UserInputDTO[] = await this.extractExcelContent(tmpFilePath);
      Logger.debug('File deleted from temporary location');
      fs.unlinkSync(tmpFilePath);
      Logger.debug('Insert records to database');
      await this.insertBulkRecords(records);
      await this.notifyJobUpdate(jobItem, JOB_QUEUE_STATUS.SUCCESS);
    } catch (error) {
      const jobItem = await this.jobQueueRepository.findOneByOrFail({
        id: jobId,
      });
      await this.notifyJobUpdate(jobItem, JOB_QUEUE_STATUS.FAILED);
      if (error.name === NotFoundException.name) {
        Logger.error('Failed to find job item', {
          jobId,
          error,
        });
      }
      Logger.error('Error processing user retry bulk upload: ', {
        jobId,
        error,
      });
    }
  };

  insertBulkRecords = async (records: UserInputDTO[]) => {
    try {
      const response = await axios.post(
        this.configService.get('FEDERATION_GATEWAY_URL')!,
        {
          query: `
            mutation bulkCreate($data: [UserInputDTO!]!) {
              bulkCreate(data: $data) {
                message
              }
            }
          `,
          variables: { data: records },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      if (response.data.errors) {
        throw response.data.errors[0].message;
      }
      return response.data.data.bulkCreate.message;
    } catch (error) {
      Logger.error('Error inserting bulk records: ', error);
      throw new CustomException(
        'Error while inserting bulk records',
        1006,
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };

  /**
   * Extracts content from an Excel file within a zip archive.
   *
   * @param {string} filePath - The path to the zip file containing the Excel file.
   * @returns {Promise<Array<UserInputDTO>>} - A promise that resolves to an array of UserInputDTO objects.
   *
   * @throws {Error} - Throws an error if the extraction process fails.
   *
   * The function reads the zip file, extracts the Excel file, and converts its content to JSON.
   * It then maps the JSON data to an array of UserInputDTO objects.
   * Each UserInputDTO object contains the name, email, and date of birth extracted from the Excel file.
   */
  extractExcelContent = async (filePath: string): Promise<Array<UserInputDTO>> => {
    const records: UserInputDTO[] = [];
    try {
      const zip = fs.createReadStream(filePath).pipe(unzipper.Parse({ forceStream: true }));
      for await (const entry of zip) {
        const fileName = entry.path;
        const type = entry.type; // 'Directory' or 'File'
        if (type === 'File' && fileName.endsWith('.xlsx')) {
          const chunks: Buffer[] = [];
          for await (const chunk of entry) {
            chunks.push(chunk);
          }
          const buffer = Buffer.concat(chunks);
          const workbook = xlsx.read(buffer, { type: 'buffer' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
          const fileRecords: UserInputDTO[] = jsonData
            .filter((array: any) => array.length > 0)
            .slice(1)
            .map((row: any) => ({
              name: row[0],
              email: row[1],
              date_of_birth: this.convertExcelDate(row[2]),
            }));
          records.push(...fileRecords);
        } else {
          entry.autodrain();
        }
      }
      return records;
    } catch (error) {
      Logger.error('Failed to extract excel file content from zip', error.message);
      throw new Error('Failed to extract excel file content from zip');
    }
  }

  /**
   * Converts an Excel date number to a string in the format YYYY-MM-DD.
   *
   * Excel stores dates as the number of days since January 1, 1900.
   * This function converts that number to a JavaScript Date object and formats it as a string.
   *
   * @param excelDate - The Excel date number to convert.
   * @returns A string representing the date in the format YYYY-MM-DD.
   */
  convertExcelDate(excelDate: number): Date {
    return new Date((excelDate - 25569) * 86400 * 1000);
  }

  /**
   * Sends upload data to a Kafka topic.
   *
   * @param {JobQueue} jobInfo - Information about the job queue.
   * @returns {Promise<void>} A promise that resolves when the data has been sent.
   */
  notifyJobUpdate = async (
    jobInfo: JobQueue,
    status: JOB_QUEUE_STATUS,
  ): Promise<void> => {
    const payload = {
      job: jobInfo,
      status: status,
      action: 'update-job-status',
    };
    Logger.log(
      'Updating job status and sending message to notification service',
    );
    await this.jobQueueService.updateJobStatus(jobInfo.id, payload.status);
    await this.kafka.produce({
      topic: 'notifications',
      messages: [
        {
          value: JSON.stringify({
            job: payload.job,
            type: 'upload',
            status: payload.status,
          }),
        },
      ],
    });
  };
}
