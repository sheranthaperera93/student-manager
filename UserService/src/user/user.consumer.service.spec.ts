import { Test, TestingModule } from '@nestjs/testing';
import { UserConsumerService } from './user.consumer.service';

describe('UserConsumerService', () => {
  let service: UserConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserConsumerService],
    }).compile();

    service = module.get<UserConsumerService>(UserConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
