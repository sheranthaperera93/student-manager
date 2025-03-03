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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserCourseService } from './user-course/user-course.service';
import { UserCourse } from './entities/user-course.entity';
import { UserCourseResolver } from './user-course/user-course.resolver';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, UserCourse]),
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
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available
      envFilePath: process.env.NODE_ENV === 'test ' ? '.env.test' : '.env', // Path to your environment file
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USERNAME'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        synchronize: false, // Enable auto-sync
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/../migrations/*{.ts,.js}'],
        migrationsRun: true,
        autoLoadEntities: true,
        logging: true,
      }),
      inject: [ConfigService]
    }),
  ],
  providers: [CourseResolver, CourseService, UserResolver, UserCourseResolver, UserCourseService],
})
export class CourseModule {}
