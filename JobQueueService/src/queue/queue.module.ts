import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { QueueProcessor } from './queue.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'bull-queue',
      redis: {
        host: 'localhost', // Redis server host
        port: 6379, // Redis server port
      },
    }),
  ],
  providers: [QueueProcessor],
  exports: [QueueProcessor],
})
export class QueueModule {}
