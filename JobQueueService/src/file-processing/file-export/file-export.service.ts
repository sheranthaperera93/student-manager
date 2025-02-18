import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Between, Repository } from 'typeorm';

import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { JobQueue } from 'src/entities/job_queue.entity';
import { JOB_QUEUE_STATUS, JOB_TYPE } from 'src/core/constants';
import { JobQueueService } from 'src/job-queue/job-queue.service';
import { ProducerService } from 'src/kafka/producer/producer.service';

@Injectable()
export class FileExportService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly kafka: ProducerService,
    private readonly jobQueueService: JobQueueService,
  ) {}

  async handleUserExport(message: string) {
    const { params } = JSON.parse(message);

    const jobItem = await this.jobQueueService.createExportJob(
      params.age,
      JOB_TYPE.EXPORTS,
    );

    const ageRange = params.age.split('-');
    const fromAge = parseInt(ageRange[0], 10);
    const toAge = parseInt(ageRange[1], 10);

    const today = new Date();
    const fromAgeDate = new Date(
      today.getFullYear() - fromAge,
      today.getMonth(),
      today.getDate(),
    );
    const toAgeDate = new Date(
      today.getFullYear() - toAge,
      today.getMonth(),
      today.getDate(),
    );

    // Fetch users which matches the age criteria
    const users: User[] = await this.userRepository.find({
      where: { date_of_birth: Between(toAgeDate, fromAgeDate) },
    });
    // Prepare data set and write to file
    const {fileName, filePath} = await this.prepareDataSet(users);

    jobItem.jobData = JSON.stringify({age: params.age, fileName, filePath});
    // Update Job status and send notification
    await this.notifyJobUpdate(jobItem);
  }

  async prepareDataSet(records: User[]): Promise<{fileName: string, filePath: string}> {
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(records);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'users');
    const buffer = xlsx.write(workbook, { type: 'buffer' });

    // Create directory if not exists
    const uploadDir = path.join(__dirname, '../', '../job-queue/', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate unique file name
    const uniqueId = Date.now();
    const fileName = `users-${uniqueId}.xlsx`;

    // Write to file
    const filePath = path.join(__dirname, '../', '../job-queue/', 'uploads', fileName);
    fs.writeFileSync(filePath, buffer);
    Logger.log(`File saved to ${filePath}`);
    return {fileName, filePath};
  }

  /**
   * Sends upload data to a Kafka topic.
   *
   * @param {User[]} records - An array of user records to be uploaded.
   * @param {JobQueue} jobInfo - Information about the job queue.
   * @returns {Promise<void>} A promise that resolves when the data has been sent.
   */
  notifyJobUpdate = async (jobInfo: JobQueue): Promise<void> => {
    try {
      const payload = {
        job: jobInfo,
        status: JOB_QUEUE_STATUS.SUCCESS,
        action: 'update-job-status',
      };
      await this.updateJobAndNotify(payload);
    } catch (error) {
      const payload = {
        job: jobInfo,
        status: JOB_QUEUE_STATUS.FAILED,
        action: 'update-job-status',
      };
      await this.updateJobAndNotify(payload);
    }
  };

  async updateJobAndNotify(payload: any) {
    Logger.log(
      'Updating job status and sending message to notification service',
      payload,
    );
    await this.jobQueueService.updateExportJobStatus(payload.job, payload.status);
    await this.kafka.produce({
      topic: 'notifications',
      messages: [
        {
          value: JSON.stringify({
            job: payload.job,
            type: 'uploads',
            status: payload.status,
          }),
        },
      ],
    });
  }
}
