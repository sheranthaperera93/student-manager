import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import axios from 'axios';
import * as xlsx from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import { JobQueue } from 'src/entities/job_queue.entity';
import { JOB_QUEUE_STATUS, JOB_TYPE } from 'src/core/constants';
import { JobQueueService } from 'src/job-queue/job-queue.service';
import { ProducerService } from 'src/kafka/producer/producer.service';
import { CustomException } from 'src/core/custom-exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileExportService {
  constructor(
    private readonly kafka: ProducerService,
    private readonly jobQueueService: JobQueueService,
    private readonly configService: ConfigService
  ) {}

  async handleUserExport(message: string) {
    try {
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
      // Since the from and to date of births are in reverse order
      const users: User[] = await this.fetchFilteredUserRecords({
        dateOfBirth: {
          from: toAgeDate.toISOString().split('T')[0],
          to: fromAgeDate.toISOString().split('T')[0],
        },
      });
      // Prepare data set and write to file
      const { fileName, filePath } = await this.prepareDataSet(users);

      jobItem.jobData = JSON.stringify({ age: params.age, fileName, filePath });
      // Update Job status and send notification
      await this.notifyJobUpdate(jobItem, JOB_QUEUE_STATUS.SUCCESS);
    } catch (error) {
      Logger.error('Error while handling user export', error);
      if (error.name === NotFoundException.name) {
        throw new CustomException(
          error.message,
          1007,
          error,
          HttpStatus.NOT_FOUND,
        );
      } else {
        throw new CustomException(
          'Error while processing user export',
          1009,
          error,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  fetchFilteredUserRecords = async (params: {
    dateOfBirth: { from: string; to: string };
  }): Promise<User[]> => {
    try {
      Logger.log('Fetching filtered user records');
      Logger.log('FEDERATION_GATEWAY_URL', this.configService.get('FEDERATION_GATEWAY_URL'));
      Logger.log('params', params);
      const response = await axios.post(
        this.configService.get('FEDERATION_GATEWAY_URL')!,
        {
          query: `
            query getUsers($dateOfBirth: DateOfBirthRangeInput!) {
              getUsers(dateOfBirth: $dateOfBirth) {
                items {
                  id
                  name
                  email
                  date_of_birth
                }
              }
            }
          `,
          variables: { dateOfBirth: params.dateOfBirth },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data.data.getUsers.items;
    } catch (error) {
      Logger.error('Error fetching filtered user records: ', error);
      throw new Error('Failed to fetch filtered user records');
    }
  };

  async prepareDataSet(
    records: User[],
  ): Promise<{ fileName: string; filePath: string }> {
    try {
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
      const filePath = path.join(
        __dirname,
        '../',
        '../job-queue/',
        'uploads',
        fileName,
      );
      fs.writeFileSync(filePath, buffer);
      Logger.log(`File saved to ${filePath}`);
      return { fileName, filePath };
    } catch (error) {
      Logger.error('Error while preparing data set for export', error);
      throw new Error('Error while preparing data set for export');
    }
  }

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
    await this.jobQueueService.updateJobStatus(
      payload.job.id,
      payload.status,
      jobInfo,
    );
    await this.kafka.produce({
      topic: 'notifications',
      messages: [
        {
          value: JSON.stringify({
            job: payload.job,
            type: 'export',
            status: payload.status,
          }),
        },
      ],
    });
  };
}
