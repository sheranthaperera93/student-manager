import { InjectQueue } from '@nestjs/bull';
import {
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import { existsSync } from 'fs';
import { join } from 'path';
import {
  JOB_QUEUE_STATUS,
  JOB_TYPE,
  JOB_TYPES,
  JobData,
} from 'src/core/constants';
import { CustomException } from 'src/core/custom-exception';
import { JobQueue } from 'src/entities/job_queue.entity';
import { EntityNotFoundError, Repository } from 'typeorm';

@Injectable()
export class JobQueueService {
  constructor(
    @InjectRepository(JobQueue)
    private readonly jobQueueRepository: Repository<JobQueue>,
    @InjectQueue('bull-queue') private readonly jobQueue: Queue,
  ) {}

  createUploadJob = async (
    filePath: string,
    fileName: string,
    type: JOB_TYPE,
  ): Promise<JobQueue> => {
    let jobQueue = new JobQueue();
    jobQueue.createdDate = new Date();
    jobQueue.status = JOB_QUEUE_STATUS.PENDING;
    let tmpJobData: JobData = {
      filePath,
      fileName,
    };
    jobQueue.type = type;
    jobQueue.jobData = JSON.stringify(tmpJobData);
    Logger.log('Inserting job queue item to DB');
    return await this.jobQueueRepository.save(jobQueue);
  };

  async updateJobStatus(
    jobId: number,
    status: JOB_QUEUE_STATUS,
    jobInfoPayload?: JobQueue,
  ): Promise<void> {
    const job = await this.jobQueueRepository
      .findOneByOrFail({ id: jobId })
      .catch((error) => {
        Logger.error('Failed to update job status. Invalid JOB ID:', {
          jobId,
          status,
          error,
        });
        throw new NotFoundException('No Job Found for ID: ' + job.id);
      });
    if (jobInfoPayload) {
      job.jobData = jobInfoPayload.jobData;
    }
    if (status === JOB_QUEUE_STATUS.SUCCESS) {
      job.jobCompleteDate = new Date();
    }
    job.status = status;
    Logger.log('Updating job status', { job });
    await this.jobQueueRepository.update({ id: job.id }, job);
  }

  async findAll(): Promise<JobQueue[]> {
    const jobs = await this.jobQueueRepository.find();
    return jobs.map((job) => ({
      ...job,
      jobCompleteDate: job.jobCompleteDate || new Date(),
    }));
  }

  async retryJobQueueItem(jobId: number): Promise<string> {
    try {
      const jobItem = await this.jobQueueRepository.findOneByOrFail({
        id: jobId,
      });
      if (jobItem.status === JOB_QUEUE_STATUS.SUCCESS) {
        Logger.error('Job entry already completed', {
          jobId,
        });
        throw new Error('Job entry already completed');
      }
      Logger.log('Adding retry job to bull queue');
      await this.jobQueue.add(
        JOB_TYPES.FILE_UPLOAD_RETRY,
        {
          type: JOB_TYPES.FILE_UPLOAD_RETRY,
          message: JSON.stringify({ jobId }),
        },
        {
          attempts: 3,
          backoff: 5000,
        },
      );
      return 'Re-try job created';
    } catch (error) {
      if (error.name === EntityNotFoundError.name) {
        throw new CustomException(
          'Failed to re-try job. Job not found',
          1012,
          {},
          HttpStatus.NOT_FOUND,
        );
      } else {
        throw new CustomException(
          'Failed to re-try job. System encountered an unexpected issue',
          1011,
          error,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }
  }

  createExportJob = async (age: string, type: JOB_TYPE): Promise<JobQueue> => {
    let jobQueue = new JobQueue();
    jobQueue.createdDate = new Date();
    jobQueue.status = JOB_QUEUE_STATUS.PENDING;
    let tmpJobData: JobData = {
      params: JSON.stringify({ age }),
      fileName: '',
      filePath: '',
    };
    jobQueue.type = type;
    jobQueue.jobData = JSON.stringify(tmpJobData);
    Logger.log('Inserting job queue item to DB');
    return await this.jobQueueRepository.save(jobQueue);
  };

  getFile(fileName: string): string {
    const filePath = join(__dirname, 'uploads', fileName);
    if (!existsSync(filePath)) {
      throw new Error('File not found');
    }
    return filePath;
  }

  fetchExport = async (id: number): Promise<string> => {
    const jobItem = await this.jobQueueRepository
      .findOneByOrFail({ id })
      .catch((error) => {
        Logger.error(
          'Failed to fetch export job. Job not found. Job ID: ' + id,
          error,
        );
        throw new CustomException(
          'No Job Found for ID: ' + id,
          1009,
          {},
          HttpStatus.NOT_FOUND,
        );
      });
    return JSON.parse(jobItem.jobData).fileName;
  };
}
