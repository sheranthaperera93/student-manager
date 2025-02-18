import { Test, TestingModule } from '@nestjs/testing';
import { FileExportService } from './file-export.service';

describe('FileExportService', () => {
  let service: FileExportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileExportService],
    }).compile();

    service = module.get<FileExportService>(FileExportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
