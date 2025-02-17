import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { JOB_QUEUE_STATUS, JOB_TYPE, JobData, User } from 'src/core/constants';
import { JobQueue } from 'src/entities/job_queue.entity';
import { JobQueueService } from 'src/job-queue/job-queue.service';
import { ProducerService } from 'src/kafka/producer/producer.service';
import { Repository } from 'typeorm';
import * as xlsx from 'xlsx';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(JobQueue)
    private readonly jobQueueRepository: Repository<JobQueue>,
    private readonly kafka: ProducerService,
    private readonly jobQueueService: JobQueueService,
  ) {}

  /**
   * Handles the file upload process.
   * 
   * @param {string} message - The message containing file details in JSON format.
   * @returns {Promise<void>} - A promise that resolves when the file upload process is complete.
   * 
   * @throws {Error} - Throws an error if there is an issue processing the file upload.
   * 
   * The function performs the following steps:
   * 1. Parses the message to extract file details.
   * 2. Creates an upload job in the job queue.
   * 3. Downloads the file from a specified URL.
   * 4. Saves the file temporarily to the local filesystem.
   * 5. Extracts content from the Excel file.
   * 6. Deletes the temporary file.
   * 7. Sends the extracted data for further processing.
   */
  handleFileUpload = async (message: string) => {
    try {
      const { fileName, filePath } = JSON.parse(message);
      const jobQueue = await this.jobQueueService.createUploadJob(filePath, fileName, JOB_TYPE.UPLOADS);
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
      const records: User[] = this.extractExcelContent(tmpFilePath);
      Logger.log('File deleted from temporary location');
      fs.unlinkSync(tmpFilePath);
      await this.sendUploadData(records, jobQueue);
    } catch (error) {
      Logger.error('Error processing file upload: ', error);
    }
  };



  /**
   * Updates the status of a job in the job queue.
   *
   * @param jobId - The ID of the job to update.
   * @param status - The new status to set for the job.
   * @throws Will throw an error if no job is found with the given ID.
   * @returns A promise that resolves when the job status has been updated.
   */
  updateJobStatus = async (jobId: number, status: JOB_QUEUE_STATUS) => {
    const jobQueueRecord = await this.jobQueueRepository.findOneBy({
      id: jobId,
    });
    if (!jobQueueRecord) {
      throw new Error('No Job Found for ID: ' + jobId);
    }
    jobQueueRecord.status = status;
    await this.jobQueueRepository.save(jobQueueRecord);
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
  extractExcelContent(filePath: string): Array<User> {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const records: User[] = jsonData.slice(0).map((row: any) => {
      return {
        name: row[0],
        email: row[1],
        date_of_birth: this.convertExcelDate(row[2]),
      };
    });
    Logger.log('Records created', records);
    return records;
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
   * @param {User[]} records - An array of user records to be uploaded.
   * @param {JobQueue} jobInfo - Information about the job queue.
   * @returns {Promise<void>} A promise that resolves when the data has been sent.
   */
  sendUploadData = async (records: User[], jobInfo: JobQueue) => {
    await this.kafka.produce({
      topic: 'user-upload-data',
      messages: [{ value: JSON.stringify({ records, job: jobInfo }) }],
    });
  };
}
