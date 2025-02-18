import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueProcessor } from './queue.processor';
import { FileUploadService } from 'src/file-processing/file-upload/file-upload.service';
import { KafkaModule } from 'src/kafka/kafka.module';
import { JobQueueService } from 'src/job-queue/job-queue.service';
import { JobQueue } from 'src/entities/job_queue.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'bull-queue',
      redis: {
        host: 'localhost', // Redis server host
        port: 6379, // Redis server port
      },
    }),
    TypeOrmModule.forFeature([JobQueue, User]),
    KafkaModule,
  ],
  providers: [QueueProcessor, FileUploadService, JobQueueService],
  exports: [QueueProcessor, BullModule],
})
export class QueueModule {}
