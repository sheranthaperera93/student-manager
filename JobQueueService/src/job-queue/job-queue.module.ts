import { Module } from '@nestjs/common';
import { JobQueueService } from './job-queue.service';
import { JobQueue } from 'src/entities/job_queue.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from 'src/kafka/kafka.module';
import { JobQueueResolver } from './job-queue.resolver';
import { QueueModule } from 'src/queue/queue.module';
import { JobQueueController } from './job-queue.controller';

@Module({
  imports: [TypeOrmModule.forFeature([JobQueue]), KafkaModule, QueueModule],
  providers: [JobQueueResolver, JobQueueService],
  controllers: [JobQueueController],
})
export class JobQueueModule {}
