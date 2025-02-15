import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadConsumerService } from './file-upload-consumer.service';

describe('FileUploadConsumerService', () => {
  let service: FileUploadConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUploadConsumerService],
    }).compile();

    service = module.get<FileUploadConsumerService>(FileUploadConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
