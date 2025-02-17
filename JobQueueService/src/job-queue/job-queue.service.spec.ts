import { Test, TestingModule } from '@nestjs/testing';
import { JobQueueService } from './job-queue.service';

describe('JobQueueService', () => {
  let service: JobQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobQueueService],
    }).compile();

    service = module.get<JobQueueService>(JobQueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
