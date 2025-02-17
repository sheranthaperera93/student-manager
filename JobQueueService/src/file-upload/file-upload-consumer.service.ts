import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bull';
import { JOB_TYPES } from 'src/core/constants';
import { ConsumerService } from 'src/kafka/consumer/consumer.service';

@Injectable()
export class FileUploadConsumerService implements OnModuleInit {
  groupId: string = 'job-queue-group';

  constructor(
    private readonly consumer: ConsumerService,
    @InjectQueue('bull-queue') private readonly jobQueue: Queue,
  ) {}

  /**
   * Initializes the module and starts the file upload consumer.
   * 
   * This method is called when the module is initialized. It starts the Kafka consumer
   * to listen to the 'user-upload-queue' topic from the beginning. For each message received,
   * it logs the message details and adds a job to the Bull queue for file upload processing.
   * 
   * @async
   * @method onModuleInit
   * @returns {Promise<void>} A promise that resolves when the consumer is started and the jobs are added to the queue.
   */
  async onModuleInit() {
    Logger.debug("File upload consumer started")
    this.consumer.consume(
      this.groupId,
      { topics: ['user-upload-queue'], fromBeginning: true },
      {
        eachMessage: async ({ topic, partition, message }) => {
          Logger.log('Kafka message received', {
            source: this.groupId,
            message: message.value?.toString(),
            partition: partition.toString(),
            topic: topic.toString(),
          });
          Logger.log('Adding job to bull queue');
          await this.jobQueue.add(
            JOB_TYPES.FILE_UPLOAD,
            {
              type: JOB_TYPES.FILE_UPLOAD,
              message: message.value?.toString(),
            },
            {
              attempts: 3,
              backoff: 5000,
            },
          );
        },
      },
    );
  }
}
