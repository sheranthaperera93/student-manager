import { Args, ID, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JobQueue } from 'src/entities/job_queue.entity';
import { JobQueueService } from './job-queue.service';

@Resolver((of) => JobQueue)
export class JobQueueResolver {
  constructor(private readonly jobQueueService: JobQueueService) {}

  @Query((returns) => [JobQueue])
  async getJobQueueItems(): Promise<JobQueue[]> {
    return this.jobQueueService.findAll();
  }

  @Mutation((returns) => String)
  async retryJobQueueItem(
    @Args({ name: 'id', type: () => ID }) id: number,
  ): Promise<string> {
    return await this.jobQueueService.retryJobQueueItem(id);
  }
  
  @Query((returns) => String)
  async downloadExport(
    @Args({ name: 'id', type: () => ID }) id: number,
  ): Promise<string> {
    return await this.jobQueueService.fetchExport(id);
  }
}
