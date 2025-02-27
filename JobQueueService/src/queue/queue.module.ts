import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueProcessor } from './queue.processor';
import { FileUploadService } from 'src/file-processing/file-upload/file-upload.service';
import { KafkaModule } from 'src/kafka/kafka.module';
import { JobQueueService } from 'src/job-queue/job-queue.service';
import { JobQueue } from 'src/entities/job_queue.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileExportService } from 'src/file-processing/file-export/file-export.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    BullModule.forRootAsync({
      useFactory: (configService) => ({
        redis: {
          host: configService.get('REDIS_HOST'), // Redis server host
          port: configService.get('REDIS_PORT'), // Redis server port
        },
      }),
      inject: [ConfigService]
    }),
    BullModule.registerQueue({
      name: 'bull-queue',
    }),
    TypeOrmModule.forFeature([JobQueue]),
    KafkaModule,
  ],
  providers: [
    QueueProcessor,
    FileUploadService,
    FileExportService,
    JobQueueService,
  ],
  exports: [QueueProcessor, BullModule],
})
export class QueueModule {}
