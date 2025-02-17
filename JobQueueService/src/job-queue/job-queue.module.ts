import { Module } from '@nestjs/common';
import { JobQueueConsumerService } from './job-queue-consumer.service';
import { JobQueueService } from './job-queue.service';
import { JobQueue } from 'src/entities/job_queue.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from 'src/kafka/kafka.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { JobQueueResolver } from './job-queue.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobQueue]),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      plugins: [ApolloServerPluginInlineTrace()],
    }),
    KafkaModule,
  ],
  providers: [JobQueueResolver, JobQueueService, JobQueueConsumerService],
})
export class JobQueueModule {}
