import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

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

  await app.startAllMicroservices();
  await app.listen(3002);
}
bootstrap();
