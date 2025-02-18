import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer/consumer.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { JOB_TYPES } from 'src/core/constants';

@Injectable()
export class FileExportConsumerService implements OnModuleInit {
  groupId: string = 'file-export-queue-group';

  constructor(
    private readonly consumer: ConsumerService,
    @InjectQueue('bull-queue') private readonly jobQueue: Queue,
  ) {}

  async onModuleInit() {
    this.consumer.consume(
      this.groupId,
      { topics: ['user-export'], fromBeginning: true },
      {
        eachMessage: async ({ topic, partition, message }) => {
          Logger.log({
            source: this.groupId,
            message: message.value?.toString(),
            partition: partition.toString(),
            topic: topic.toString(),
          });
          Logger.log('Adding export job to bull queue');
          await this.jobQueue.add(
            JOB_TYPES.FILE_EXPORT,
            {
              type: JOB_TYPES.FILE_EXPORT,
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
