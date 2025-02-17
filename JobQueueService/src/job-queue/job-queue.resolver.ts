import { Query, Resolver } from '@nestjs/graphql';
import { JobQueue } from 'src/entities/job_queue.entity';
import { JobQueueService } from './job-queue.service';

@Resolver((of) => JobQueue)
export class JobQueueResolver {
  constructor(private readonly jobQueueService: JobQueueService) {}

  @Query((returns) => [JobQueue])
  async getJobQueueItems(): Promise<JobQueue[]> {
    return this.jobQueueService.findAll();
  }
}
