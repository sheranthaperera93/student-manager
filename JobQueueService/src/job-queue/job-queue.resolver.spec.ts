import { Test, TestingModule } from '@nestjs/testing';
import { JobQueueResolver } from './job-queue.resolver';

describe('JobQueueResolver', () => {
  let resolver: JobQueueResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JobQueueResolver],
    }).compile();

    resolver = module.get<JobQueueResolver>(JobQueueResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
