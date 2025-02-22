import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { FileProcessingModule } from './file-processing/file-processing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobQueueModule } from './job-queue/job-queue.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available
      envFilePath: '.env', // Path to your environment file
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
