import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer/consumer.service';
import { UserService } from './user.service';
import { ProducerService } from 'src/kafka/producer/producer.service';
import { JOB_QUEUE_STATUS } from 'src/core/constants';

@Injectable()
export class UserConsumerService implements OnModuleInit {
  groupId: string = 'job-queue-group';

  constructor(
    private readonly consumer: ConsumerService,
    private readonly userService: UserService,
    private readonly kafka: ProducerService,
  ) {}

  async onModuleInit() {
    Logger.debug("User upload data consumer started")
    this.consumer.consume(
      this.groupId,
      { topics: ['user-upload-data'], fromBeginning: true },
      {
        eachMessage: async ({ topic, partition, message }) => {
          Logger.log('Kafka message received', {
            source: this.groupId,
            message: message.value?.toString(),
            partition: partition.toString(),
            topic: topic.toString(),
          });
          this.handleUserUploadData(message.value.toString());
        },
      },
    );
  }

  async handleUserUploadData(message: string) {
    const { records, jobId } = JSON.parse(message);
    try {
      await this.userService.createBulk(records);
      const payload = {
        jobId: jobId,
        status: JOB_QUEUE_STATUS.SUCCESS,
        action: 'update-job-status',
      };
      await this.kafka.produce({
        topic: 'job-queue-actions',
        messages: [{ value: JSON.stringify(payload) }],
      });
    } catch (error) {
      Logger.error('Failed to parse create records JSON parse error: ', {
        error,
      });
      const payload = {
        jobId: jobId,
        status: JOB_QUEUE_STATUS.FAILED,
        action: 'update-job-status',
      };
      await this.kafka.produce({
        topic: 'job-queue-actions',
        messages: [{ value: JSON.stringify(payload) }],
      });
    }
  }
}
