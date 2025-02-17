import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [KafkaModule, EventsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
