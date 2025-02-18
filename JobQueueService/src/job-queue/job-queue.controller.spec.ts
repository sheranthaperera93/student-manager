import { Test, TestingModule } from '@nestjs/testing';
import { JobQueueController } from './job-queue.controller';

describe('JobQueueController', () => {
  let controller: JobQueueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobQueueController],
    }).compile();

    controller = module.get<JobQueueController>(JobQueueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
