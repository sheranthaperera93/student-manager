import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { JOB_QUEUE_STATUS, JobData, User } from 'src/core/constants';
import { JobQueue } from 'src/entities/job_queue.entity';
import { ProducerService } from 'src/kafka/producer/producer.service';
import { Repository } from 'typeorm';
import * as xlsx from 'xlsx';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(JobQueue)
    private readonly jobQueueRepository: Repository<JobQueue>,
    private readonly kafka: ProducerService,
  ) {}

  handleFileUpload = async (message: string) => {
    try {
      const { fileName, filePath } = JSON.parse(message);
      const jobQueue = await this.createUploadJob(filePath, fileName);
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

  createUploadJob = async (
    filePath: string,
    fileName: string,
  ): Promise<JobQueue> => {
    let jobQueue = new JobQueue();
    jobQueue.createdDate = new Date();
    jobQueue.status = JOB_QUEUE_STATUS.PENDING;
    let tmpJobData: JobData = {
      filePath,
      fileName,
    };
    jobQueue.jobData = JSON.stringify(tmpJobData);
    Logger.log("Inserting job queue item to DB")
    return await this.jobQueueRepository.save(jobQueue);
  };

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

  convertExcelDate(excelDate: number): string {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }

  sendUploadData = async (records: User[], jobInfo: JobQueue) => {
    await this.kafka.produce({
      topic: 'user-upload-data',
      messages: [{ value: JSON.stringify({ records, jobId: jobInfo.id }) }],
    });
  };
}
