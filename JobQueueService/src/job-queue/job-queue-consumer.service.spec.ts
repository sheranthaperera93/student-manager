import { Test, TestingModule } from '@nestjs/testing';
import { JobQueueConsumerService } from './job-queue-consumer.service';

describe('JobQueueConsumerService', () => {
  let service: JobQueueConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobQueueConsumerService],
    }).compile();

    service = module.get<JobQueueConsumerService>(JobQueueConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
