import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: ['host.docker.internal:9092'],
    clientId: 'nestjs-consumer-server',
  });

  private readonly consumers: Consumer[] = [];

  async onApplicationShutdown() {
    for (const consumer of this.consumers) {
      await consumer
        .disconnect()
        .catch((e) => console.error('Error disconnecting consumer', e));
    }
  }

  async consume(
    groupId: string,
    topics: ConsumerSubscribeTopics,
    config: ConsumerRunConfig,
  ) {
    const consumer: Consumer = this.kafka.consumer({ groupId });
    await consumer.connect().catch(e => console.error(e));
    await consumer.subscribe(topics);
    await consumer.run(config);
    this.consumers.push(consumer);
  }
}
