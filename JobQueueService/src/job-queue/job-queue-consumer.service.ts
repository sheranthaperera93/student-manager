import { Injectable, Logger } from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer/consumer.service';
import { JobQueueService } from './job-queue.service';

@Injectable()
export class JobQueueConsumerService {
  groupId: string = 'job-queue-group';

  constructor(
    private readonly consumer: ConsumerService,
    private readonly jobQueueService: JobQueueService,
  ) {}

  async onModuleInit() {
    Logger.debug('Job queue consumer started')
    this.consumer.consume(
      this.groupId,
      { topics: ['job-queue-actions'], fromBeginning: true },
      {
        eachMessage: async ({ topic, partition, message }) => {
          Logger.log('Kafka message received', {
            source: this.groupId,
            message: message.value?.toString(),
            partition: partition.toString(),
            topic: topic.toString(),
          });
          this.jobQueueService.updateJobStatus(message.value?.toString()!);
        },
      },
    );
  }
}
