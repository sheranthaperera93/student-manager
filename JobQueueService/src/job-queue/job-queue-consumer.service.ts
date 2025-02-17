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

  /**
   * Initializes the job queue consumer when the module is initialized.
   *
   * This method is called automatically by the framework when the module is initialized.
   * It starts the Kafka consumer to listen for messages on the 'job-queue-actions' topic
   * from the beginning. For each received message, it logs the message details and updates
   * the job status using the jobQueueService.
   *
   * @async
   * @returns {Promise<void>} A promise that resolves when the consumer is successfully started.
   */
  async onModuleInit(): Promise<void> {
    await this.consumer.consume(
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
