import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  Consumer,
  ConsumerRunConfig,
  ConsumerSubscribeTopics,
  Kafka,
} from 'kafkajs';

@Injectable()
export class ConsumerService implements OnApplicationShutdown {
  private readonly kafka: Kafka;
  private readonly consumers: Consumer[] = [];

  constructor(private readonly configService: ConfigService) {
    this.kafka = new Kafka({
      brokers: [this.configService.get('KAFKA_BROKER')!],
      clientId: this.configService.get('KAFKA_CLIENT_ID'),
    });
  }

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
      .catch((e) =>
        Logger.error('Filed to connect consumer to kafka broker ' 
          + e),
      );
    await consumer
      .subscribe(topic)
      .catch((e) =>
        Logger.error('Filed to subscribe to topic : ' + { topic, error: e }),
      );
    await consumer.run(config);
    this.consumers.push(consumer);
  }
}
