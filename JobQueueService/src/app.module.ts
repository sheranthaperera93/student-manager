import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { FileProcessingModule } from './file-processing/file-processing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobQueueModule } from './job-queue/job-queue.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available
      envFilePath: '.env', // Path to your environment file
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
        path: './src/job-queue-schema.gql',
      },
      plugins: [ApolloServerPluginInlineTrace()],
    }),
    BullModule.forRootAsync({
      useFactory: (configService) => ({
        redis: {
          host: configService.get('REDIS_HOST'), // Redis server host
          port: configService.get('REDIS_PORT'), // Redis server port
        },
      }),
      inject: [ConfigService]
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
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true,
        autoLoadEntities: true,
        logging: true,
      }),
      inject: [ConfigService]
    }),
    KafkaModule,
    FileProcessingModule,
    JobQueueModule,
  ],
})
export class AppModule {}
