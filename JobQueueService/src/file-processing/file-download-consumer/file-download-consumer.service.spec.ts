import { Test, TestingModule } from '@nestjs/testing';
import { FileDownloadConsumerService } from './file-download-consumer.service';

describe('FileDownloadConsumerService', () => {
  let service: FileDownloadConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileDownloadConsumerService],
    }).compile();

    service = module.get<FileDownloadConsumerService>(FileDownloadConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
