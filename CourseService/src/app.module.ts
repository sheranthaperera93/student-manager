import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CourseModule } from './course/course.module';
import { User } from './entities/user.entity';

@Module({
  imports: [
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
    inject: [ConfigService],
  }),
  CourseModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
