import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { ProducerService } from './kafka/producer/producer.service';
import { ConsumerService } from './kafka/consumer/consumer.service';
import { QueueModule } from './queue/queue.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileUploadModule } from './file-upload/file-upload.module';
import { JobQueueModule } from './job-queue/job-queue.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'sheranthap',
      password: 'Test@123',
      database: 'studentmanagement',
      synchronize: false, // Enable auto-sync
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      migrationsRun: true,
      autoLoadEntities: true,
      logging: true,
    }),
    KafkaModule,
    QueueModule,
    FileUploadModule,
    JobQueueModule,
  ],
  providers: [ProducerService, ConsumerService],
})
export class AppModule {}
