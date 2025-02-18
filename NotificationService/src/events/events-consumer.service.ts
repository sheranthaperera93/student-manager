import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConsumerService } from 'src/kafka/consumer/consumer.service';
import { EventsGateway } from './events.gateway';

@Injectable()
export class EventsConsumerService implements OnModuleInit {
  groupId: string = 'event-queue-group';

  constructor(
    private readonly consumer: ConsumerService,
    private readonly eventsGateway: EventsGateway,
  ) {}

  async onModuleInit() {
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
