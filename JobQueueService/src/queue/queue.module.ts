import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueProcessor } from './queue.processor';
import { FileUploadService } from 'src/file-processing/file-upload/file-upload.service';
import { KafkaModule } from 'src/kafka/kafka.module';
import { JobQueueService } from 'src/job-queue/job-queue.service';
import { JobQueue } from 'src/entities/job_queue.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { FileExportService } from 'src/file-processing/file-export/file-export.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService) => ({
        name: 'bull-queue',
        redis: {
          host: configService.get('REDIS_HOST'), // Redis server host
          port: configService.get('REDIS_PORT'), // Redis server port
        },
      }),
      inject: [ConfigService]
    }),
    TypeOrmModule.forFeature([JobQueue, User]),
    KafkaModule,
  ],
  providers: [QueueProcessor, FileUploadService, FileExportService, JobQueueService],
  exports: [QueueProcessor, BullModule],
})
export class QueueModule {}
