import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JOB_QUEUE_STATUS } from 'src/core/constants';
import { JobQueue } from 'src/entities/job_queue.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JobQueueService {
  constructor(
    @InjectRepository(JobQueue)
    private readonly jobQueueRepository: Repository<JobQueue>,
  ) {}

  async updateJobStatus(message: string) {
    const { jobId, status } = JSON.parse(message);
    const jobItem = await this.jobQueueRepository.findOneBy({ id: jobId });
    if (jobItem && status === JOB_QUEUE_STATUS.SUCCESS) {
      this.jobQueueRepository.update(
        { id: jobId },
        { jobCompleteDate: new Date(), status: JOB_QUEUE_STATUS.SUCCESS },
      );
    } else if (jobItem && status === JOB_QUEUE_STATUS.FAILED) {
      this.jobQueueRepository.update(
        { id: jobId },
        { jobCompleteDate: new Date(), status: JOB_QUEUE_STATUS.FAILED },
      );
    } else {
      Logger.error('Failed to update job status. Invalid JOB ID : ', {
        jobId,
        status,
      });
    }
  }
}
