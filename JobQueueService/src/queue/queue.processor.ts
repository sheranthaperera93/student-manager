import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';

@Processor('bull-queue')
@Injectable()
export class QueueProcessor {
  constructor(
    @InjectQueue('bull-queue') private readonly bullQueue: Queue,
  ) {}

  @Process()
  async handleJob(job: Job<unknown>) {
    console.log('Processing Bull JS job:', job.data);
    // Add your job processing logic here
    const jobCount = await this.bullQueue.count();
    console.log("Job count", jobCount);
    // this.bullQueue.add()
  }
}
