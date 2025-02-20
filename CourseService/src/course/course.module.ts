import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { CourseResolver } from './course.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { User } from './entities/user.entity';
import { UserResolver } from './user.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
        path: './src/course-schema.gql',
      },
      plugins: [ApolloServerPluginInlineTrace()],
      buildSchemaOptions: {
        orphanedTypes: [User],
      },
    }),
  ],
  providers: [CourseResolver, CourseService, UserResolver],
})
export class CourseModule {}
