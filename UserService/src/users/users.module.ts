import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UsersController } from './users.controller';
import { JobQueue } from 'src/entities/job_queue.entity';
import { ProducerService } from 'src/kafka/producer/producer.service';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
  providers: [UsersResolver, UsersService, ProducerService],
  imports: [
    TypeOrmModule.forFeature([User, JobQueue]),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      plugins: [ApolloServerPluginInlineTrace()],
    }),
    KafkaModule
  ],
  controllers: [UsersController],
})
export class UsersModule {}
