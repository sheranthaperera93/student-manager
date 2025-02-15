import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { FileProcessingModule } from './file-processing/file-processing.module';
import { ProducerService } from './kafka/producer/producer.service';
import { ConsumerService } from './kafka/consumer/consumer.service';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [KafkaModule, FileProcessingModule, QueueModule],
  providers: [ProducerService, ConsumerService],
})
export class AppModule {}
