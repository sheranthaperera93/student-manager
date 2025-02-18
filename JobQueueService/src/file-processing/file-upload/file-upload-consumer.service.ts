import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer/consumer.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JOB_TYPES } from 'src/core/constants';

@Injectable()
export class FileUploadConsumerService implements OnModuleInit {
  groupId: string = 'job-queue-group';

  constructor(
    private readonly consumer: ConsumerService,
    @InjectQueue('bull-queue') private readonly jobQueue: Queue,
  ) {}

  async onModuleInit() {
    this.consumer.consume(
      this.groupId,
      { topics: ['user-upload'], fromBeginning: true },
      {
        eachMessage: async ({ topic, partition, message }) => {
          Logger.log({
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
