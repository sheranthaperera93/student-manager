import { Test, TestingModule } from '@nestjs/testing';
import { FileExportConsumerService } from './file-export-consumer.service';

describe('FileExportConsumerService', () => {
  let service: FileExportConsumerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileExportConsumerService],
    }).compile();

    service = module.get<FileExportConsumerService>(FileExportConsumerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
