import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Producer, ProducerRecord } from 'kafkajs';

@Injectable()
export class ProducerService implements OnModuleInit, OnApplicationShutdown {
  private readonly kafka = new Kafka({
    brokers: ['host.docker.internal:9092'],
    clientId: 'nestjs-consumer-server',
    connectionTimeout: 5000,
  });

  private readonly producer: Producer = this.kafka.producer();

  async onApplicationShutdown() {
    await this.producer.disconnect();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async produce(record: ProducerRecord) {
    await this.producer.send(record);
  }
}
