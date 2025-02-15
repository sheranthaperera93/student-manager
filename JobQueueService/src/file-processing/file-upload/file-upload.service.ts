import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { JOB_QUEUE_STATUS, UserUploadRecord } from 'src/core/constants';
import { JobQueue } from 'src/entities/job_queue.entity';
import { Repository } from 'typeorm';
import * as xlsx from 'xlsx';

@Injectable()
export class FileUploadService {
  constructor(
    @InjectRepository(JobQueue)
    private readonly jobQueueRepository: Repository<JobQueue>,
  ) {}

  handleFileUpload = async (message: string) => {
    const { fileName, jobId } = JSON.parse(message);
    try {
      // Update the job status
      console.log('Updating the job status to ', JOB_QUEUE_STATUS.IN_PROGRESS);
      await this.updateJobStatus(jobId, JOB_QUEUE_STATUS.IN_PROGRESS);
      const response = await axios.get(
        `http://localhost:3002/api/users/upload/${fileName}`,
        { responseType: 'arraybuffer' },
      );
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(__dirname, 'uploads', fileName);
      fs.writeFileSync(filePath, response.data);
      console.log(`File temporary saved to ${filePath}`);
      const records: UserUploadRecord[] = this.extractExcelContent(filePath);
      console.log('File deleted from temporary location');
      fs.unlinkSync(filePath);
      console.log(JSON.stringify(records));
    } catch (error) {
      console.error('Error processing file upload: ', error);
    }
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

  extractExcelContent(filePath: string): Array<UserUploadRecord> {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    const records: UserUploadRecord[] = jsonData.slice(0).map((row: any) => {
      const dateOfBirth = this.convertExcelDate(row[2]);
      return {
        name: row[0],
        email: row[1],
        dateOfBirth,
      };
    });
    console.log('Records created', records);
    return records;
  }

  convertExcelDate(excelDate: number): string {
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }
}
