import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { JOB_QUEUE_STATUS, JOB_TYPE } from 'src/core/constants';
import { CustomException } from 'src/core/custom-exception';
import { JobQueue } from 'src/entities/job_queue.entity';
import { User } from 'src/entities/user.entity';
import { JobQueueService } from 'src/job-queue/job-queue.service';
import { ProducerService } from 'src/kafka/producer/producer.service';
import { BulkUser } from 'src/models/bulk-user.model';
import { Repository } from 'typeorm';
import * as xlsx from 'xlsx';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(JobQueue)
    private readonly jobQueueRepository: Repository<JobQueue>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly kafka: ProducerService,
    private readonly jobQueueService: JobQueueService,
  ) {}

  handleFileUpload = async (message: string) => {
    try {
      const { fileName, filePath } = JSON.parse(message);
      const jobItem = await this.jobQueueService.createUploadJob(
        filePath,
        fileName,
        JOB_TYPE.UPLOADS,
      );
      const response = await axios.get(
        `http://localhost:3002/api/users/upload/${fileName}`,
        { responseType: 'arraybuffer' },
      );
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const tmpFilePath = path.join(__dirname, 'uploads', fileName);
      fs.writeFileSync(tmpFilePath, response.data);
      Logger.debug(`File temporary saved to ${tmpFilePath}`);
      const records: BulkUser[] = this.extractExcelContent(tmpFilePath);
      Logger.log('File deleted from temporary location');
      fs.unlinkSync(tmpFilePath);
      Logger.debug('Insert records to database');
      await this.userRepository.save(records);
      await this.notifyJobUpdate(jobItem);
    } catch (error) {
      Logger.error('Error processing user bulk upload: ', error);
      throw new CustomException(
        'Error while processing user bulk upload',
        1006,
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  };

  handleRetryJobQueueItem = async (message: string) => {
    const { jobId } = JSON.parse(message);
    try {
      const jobItem = await this.jobQueueRepository.findOneByOrFail({ id: jobId });
      const { fileName } = JSON.parse(jobItem.jobData);
      const response = await axios.get(
        `http://localhost:3002/api/users/upload/${fileName}`,
        { responseType: 'arraybuffer' },
      );
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const tmpFilePath = path.join(__dirname, 'uploads', fileName);
      fs.writeFileSync(tmpFilePath, response.data);
      Logger.log(`File temporary saved to ${tmpFilePath}`);
      const records: BulkUser[] = this.extractExcelContent(tmpFilePath);
      Logger.log('File deleted from temporary location');
      fs.unlinkSync(tmpFilePath);
      Logger.log('Insert records to database');
      await this.userRepository.save(records);
      await this.notifyJobUpdate(jobItem);
    } catch (error) {
      Logger.error('Error processing user retry bulk upload: ', {jobId, error});
      if (error.name === NotFoundException.name) {
        throw new CustomException(
          error.message,
          1007,
          error,
          HttpStatus.NOT_FOUND,
        );
      } else {
        throw new CustomException(
          'Error while processing user retry bulk upload',
          1010,
          error,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  };

  /**
   * Extracts content from an Excel file and converts it into an array of User objects.
   *
   * @param {string} filePath - The path to the Excel file to be read.
   * @returns {Array<User>} An array of User objects extracted from the Excel file.
   *
   * The Excel file is expected to have the following columns in the first sheet:
   * - Column 1: Name (string)
   * - Column 2: Email (string)
   * - Column 3: Date of Birth (Excel date format)
   *
   * The method reads the first sheet of the Excel file, converts the data to JSON,
   * and maps each row to a User object. The date of birth is converted using the
   * `convertExcelDate` method.
   *
   * @example
   * const users = extractExcelContent('/path/to/excel/file.xlsx');
   * console.log(users);
   */
  extractExcelContent(filePath: string): Array<BulkUser> {
    try {
      const workbook = xlsx.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
      const records: BulkUser[] = jsonData
        .filter((array: any) => array.length > 0)
        .slice(0)
        .map((row: any) => ({
          name: row[0],
          email: row[1],
          date_of_birth: this.convertExcelDate(row[2]),
        }));
      Logger.log('Records created', records);
      return records;
    } catch (error) {
      Logger.error("Failed to extract excel file content", error.message);
      throw new Error("Failed to extract excel file content");
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
  convertExcelDate(excelDate: number): string {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  /**
   * Sends upload data to a Kafka topic.
   *
   * @param {JobQueue} jobInfo - Information about the job queue.
   * @returns {Promise<void>} A promise that resolves when the data has been sent.
   */
  notifyJobUpdate = async (jobInfo: JobQueue): Promise<void> => {
    const payload = {
      job: jobInfo,
      status: JOB_QUEUE_STATUS.SUCCESS,
      action: 'update-job-status',
    };
    Logger.log(
      'Updating job status and sending message to notification service',
      payload,
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
