import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { EventsConsumerService } from './events-consumer.service';
import { KafkaModule } from 'src/kafka/kafka.module';

@Module({
    imports: [KafkaModule],
    providers: [EventsGateway, EventsConsumerService]
})
export class EventsModule {}
