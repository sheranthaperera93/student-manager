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

  /**
   * Initializes the module and starts the user upload data consumer.
   * Logs a debug message indicating the consumer has started.
   * Consumes messages from the 'user-upload-data' topic from the beginning.
   * For each received message, logs the message details and handles the user upload data.
   *
   * @async
   * @method onModuleInit
   * @returns {Promise<void>} A promise that resolves when the module initialization is complete.
   */
  async onModuleInit() {
    Logger.debug('User upload data consumer started');
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

  /**
   * Handles the user upload data by parsing the message, creating user records in bulk,
   * and sending event messages based on the success or failure of the operation.
   *
   * @param {string} message - The message containing user records and job ID in JSON format.
   * @returns {Promise<void>} - A promise that resolves when the operation is complete.
   *
   * @throws {Error} - Throws an error if the JSON parsing or user record creation fails.
   */
  async handleUserUploadData(message: string) {
    const { records, jobId } = JSON.parse(message);
    try {
      await this.userService.createBulk(records);
      const payload = {
        jobId: jobId,
        status: JOB_QUEUE_STATUS.SUCCESS,
        action: 'update-job-status',
      };
      this.sendEventMessages(payload);
    } catch (error) {
      Logger.error('Failed to parse create records JSON parse error: ', {
        error,
      });
      const payload = {
        jobId: jobId,
        status: JOB_QUEUE_STATUS.FAILED,
        action: 'update-job-status',
      };
      this.sendEventMessages(payload);
    }
  }

  /**
   * Sends event messages to Kafka topics.
   *
   * This method produces messages to two Kafka topics: 'job-queue-actions' and 'notifications'.
   * The first message contains the entire payload, while the second message contains a subset
   * of the payload with the jobId and status.
   *
   * @param payload - The data to be sent in the Kafka messages. It should contain at least
   *                  the properties `jobId` and `status`.
   * @returns A promise that resolves when both messages have been successfully produced.
   */
  async sendEventMessages(payload: any) {
    await this.kafka.produce({
      topic: 'job-queue-actions',
      messages: [{ value: JSON.stringify(payload) }],
    });
    await this.kafka.produce({
      topic: 'notifications',
      messages: [
        {
          value: JSON.stringify({
            jobId: payload.jobId,
            status: payload.status,
          }),
        },
      ],
    });
  }
}
