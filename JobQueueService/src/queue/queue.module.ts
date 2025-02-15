import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueProcessor } from './queue.processor';
import { FileUploadService } from 'src/file-processing/file-upload/file-upload.service';
import { JobQueue } from 'src/entities/job_queue.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'bull-queue',
      redis: {
        host: 'localhost', // Redis server host
        port: 6379, // Redis server port
      },
    }),
    TypeOrmModule.forFeature([JobQueue]),
  ],
  providers: [QueueProcessor, FileUploadService],
  exports: [QueueProcessor, BullModule],
})
export class QueueModule {}
