import { Module } from '@nestjs/common';
import { FileUploadConsumerService } from './file-upload-consumer.service';
import { KafkaModule } from 'src/kafka/kafka.module';
import { QueueModule } from 'src/queue/queue.module';
import { FileUploadService } from './file-upload.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobQueue } from 'src/entities/job_queue.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobQueue]), KafkaModule, QueueModule],
  providers: [FileUploadConsumerService, FileUploadService],
})
export class FileUploadModule {}
