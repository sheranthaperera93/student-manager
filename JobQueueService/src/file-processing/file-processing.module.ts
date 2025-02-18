import { Module } from '@nestjs/common';
import { FileUploadConsumerService } from './file-upload/file-upload-consumer.service';
import { KafkaModule } from 'src/kafka/kafka.module';
import { QueueModule } from 'src/queue/queue.module';
import { FileUploadService } from './file-upload/file-upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobQueue } from 'src/entities/job_queue.entity';
import { JobQueueService } from 'src/job-queue/job-queue.service';
import { User } from 'src/entities/user.entity';
import { FileExportService } from './file-export/file-export.service';
import { FileExportConsumerService } from './file-export/file-export-consumer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobQueue, User]),
    KafkaModule,
    QueueModule,
  ],
  providers: [
    FileUploadConsumerService,
    FileUploadService,
    JobQueueService,
    FileExportService,
    FileExportConsumerService,
  ],
})
export class FileProcessingModule {}
