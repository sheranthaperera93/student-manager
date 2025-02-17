import { Test, TestingModule } from '@nestjs/testing';
import { EventsConsumerService } from './events-consumer.service';

describe('EventsConsumerService', () => {
  let service: EventsConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsConsumerService],
    }).compile();

    service = module.get<EventsConsumerService>(EventsConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
