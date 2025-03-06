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
import { KafkaModule } from 'src/kafka/kafka.module';
import { HttpModule } from '@nestjs/axios';
import { UserCourseService } from './user-course/user-course.service';
import { Course } from 'src/entities/course.entity';
import { UserCourse } from 'src/entities/user-course.entity';
import { CourseResolver } from './course.resolver';

@Module({
  providers: [UsersResolver, UsersService, UserCourseService, CourseResolver],
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
