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
import { User } from 'src/users/entities/user.entity';
import { UsersController } from './users.controller';
import { KafkaModule } from 'src/kafka/kafka.module';
import { HttpModule } from '@nestjs/axios';
import { UserCourseService } from './user-course/user-course.service';
import { Course } from 'src/users/entities/course.entity';
import { UserCourse } from 'src/users/entities/user-course.entity';

@Module({
  providers: [UsersResolver, UsersService, UserCourseService],
  imports: [
    TypeOrmModule.forFeature([User, UserCourse, Course]),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
        path: './src/user-schema.gql',
      },
      plugins: [ApolloServerPluginInlineTrace()],
      buildSchemaOptions: {
        orphanedTypes: [Course],
      },
    }),
    KafkaModule,
    HttpModule
  ],
  controllers: [UsersController],
})
export class UsersModule {}
