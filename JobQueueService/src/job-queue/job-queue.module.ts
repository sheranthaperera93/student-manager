import { Module } from '@nestjs/common';
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
import { User } from 'src/entities/user.entity';
import { QueueModule } from 'src/queue/queue.module';
import { JobQueueController } from './job-queue.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([JobQueue, User]),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
        path: './src/job-queue-schema.gql',
      },
      plugins: [ApolloServerPluginInlineTrace()],
    }),
    KafkaModule,
    QueueModule
  ],
  providers: [JobQueueResolver, JobQueueService],
  controllers: [JobQueueController],
})
export class JobQueueModule {}
