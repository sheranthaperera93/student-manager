import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
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
      consumer.disconnect();
    }
  }

  async consume(
    groupId: string,
    topic: ConsumerSubscribeTopics,
    config: ConsumerRunConfig,
  ) {
    const consumer: Consumer = this.kafka.consumer({ groupId });
    await consumer
      .connect()
      .then(() => Logger.debug('Consumer connected successfully'))
      .catch((e) => Logger.error(e));
    await consumer.subscribe(topic);
    await consumer.run(config);
    this.consumers.push(consumer);
  }
}
