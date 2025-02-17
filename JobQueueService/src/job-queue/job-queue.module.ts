import { Module } from '@nestjs/common';
import { JobQueueConsumerService } from './job-queue-consumer.service';
import { JobQueueService } from './job-queue.service';
import { JobQueue } from 'src/entities/job_queue.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  imports: [TypeOrmModule.forFeature([JobQueue]), KafkaModule],
  providers: [JobQueueService, JobQueueConsumerService],
})
export class JobQueueModule {}
