import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JOB_QUEUE_STATUS, JOB_TYPE, JobData } from 'src/core/constants';
import { JobQueue } from 'src/entities/job_queue.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JobQueueService {
  constructor(
    @InjectRepository(JobQueue)
    private readonly jobQueueRepository: Repository<JobQueue>,
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
    return await this.jobQueueRepository.find();
  }
}
