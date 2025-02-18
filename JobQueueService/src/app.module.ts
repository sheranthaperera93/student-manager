import { Module } from '@nestjs/common';
import { KafkaModule } from './kafka/kafka.module';
import { FileProcessingModule } from './file-processing/file-processing.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobQueueModule } from './job-queue/job-queue.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'sheranthap',
      password: 'Test@123',
      database: 'studentmanagement',
      synchronize: false, // Enable auto-sync
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      migrationsRun: true,
      autoLoadEntities: true,
      logging: true,
    }),
    KafkaModule,
    FileProcessingModule,
    JobQueueModule,
  ],
})
export class AppModule {}
