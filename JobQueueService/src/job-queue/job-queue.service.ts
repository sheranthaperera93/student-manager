import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bull';
import {
  JOB_QUEUE_STATUS,
  JOB_TYPE,
  JOB_TYPES,
  JobData,
} from 'src/core/constants';
import { JobQueue } from 'src/entities/job_queue.entity';
import { Repository } from 'typeorm';

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
    job: JobQueue,
    status: JOB_QUEUE_STATUS,
  ): Promise<void> {
    const jobItem = await this.jobQueueRepository.findOneBy({ id: job.id });
    if (jobItem) {
      const updateData = {
        jobCompleteDate: new Date(),
        status,
      };
      await this.jobQueueRepository.update({ id: job.id }, updateData);
    } else {
      Logger.error('Failed to update job status. Invalid JOB ID:', {
        jobId: job.id,
        status,
      });
    }
  }

  async findAll(): Promise<JobQueue[]> {
    const jobs = await this.jobQueueRepository.find();
    return jobs.map((job) => ({
      ...job,
      jobCompleteDate: job.jobCompleteDate || new Date(),
    }));
  }

  async retryJobQueueItem(jobId: number): Promise<string> {
    const jobItem = await this.jobQueueRepository.findOneBy({ id: jobId });
    if (jobItem && jobItem.status !== JOB_QUEUE_STATUS.FAILED) {
      Logger.error(
        'Failed to re-try job. Job either not found or already completed',
        {
          jobId,
        },
      );
      throw new Error('Failed to re-try job. Job either not found or already completed');
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
  }
}
