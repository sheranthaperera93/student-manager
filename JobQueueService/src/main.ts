import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Create TCP Connection for Bull and Redis
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '127.0.0.1',
      port: 3006,
    },
  });
  // Create KAFKA Connection for Message Broker
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'nestjs-consumer-server',
        brokers: ['host.docker.internal:9092'],
      },
      consumer: {
        groupId: 'job-queue-group',
        sessionTimeout: 30000, // Increase session timeout to 30 seconds
      },
    },
  });
  // Start all microservices
  await app.startAllMicroservices();
  await app.listen(3006);
}
bootstrap();
