import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer/consumer.service';
import { EventsGateway } from './events.gateway';

@Injectable()
export class EventsConsumerService implements OnModuleInit {
  groupId: string = 'job-queue-group';

  constructor(
    private readonly consumer: ConsumerService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  /**
   * Initializes the module and starts the Kafka consumer to listen for messages on the 'notifications' topic.
   * Logs a debug message indicating that the user upload data consumer has started.
   * Consumes messages from the specified Kafka topic and handles each message by logging its details
   * and passing it to the events gateway for further processing.
   *
   * @async
   * @method onModuleInit
   * @returns {Promise<void>} A promise that resolves when the module initialization is complete.
   */
  async onModuleInit() {
    Logger.debug('User upload data consumer started');
    this.consumer.consume(
      this.groupId,
      { topics: ['notifications'], fromBeginning: true },
      {
        eachMessage: async ({ topic, partition, message }) => {
          Logger.log('Kafka message received', {
            source: this.groupId,
            message: message.value?.toString(),
            partition: partition.toString(),
            topic: topic.toString(),
          });
          this.eventsGateway.handleMessage(message.value?.toString()!);
        },
      },
    );
  }
}
