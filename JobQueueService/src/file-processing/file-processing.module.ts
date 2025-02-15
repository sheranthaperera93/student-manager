import { Module } from '@nestjs/common';
import { FileUploadConsumerService } from './file-upload-consumer/file-upload-consumer.service';
import { FileDownloadConsumerService } from './file-download-consumer/file-download-consumer.service';
import { KafkaModule } from 'src/kafka/kafka.module';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [
    KafkaModule, 
    QueueModule],
  providers: [FileUploadConsumerService, FileDownloadConsumerService],
})
export class FileProcessingModule {}
