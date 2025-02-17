import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { UserController } from './user.controller';
import { ProducerService } from 'src/kafka/producer/producer.service';
import { KafkaModule } from 'src/kafka/kafka.module';
import { UserConsumerService } from './user.consumer.service';

@Module({
  providers: [UserResolver, UserService, ProducerService, UserConsumerService],
  imports: [
    TypeOrmModule.forFeature([User]),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      plugins: [ApolloServerPluginInlineTrace()],
    }),
    KafkaModule
  ],
  controllers: [UserController],
})
export class UserModule {}
