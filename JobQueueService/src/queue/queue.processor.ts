import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { JOB_TYPES, JobItem } from 'src/core/constants';
import { FileExportService } from 'src/file-processing/file-export/file-export.service';
import { FileUploadService } from 'src/file-processing/file-upload/file-upload.service';

@Processor('bull-queue')
@Injectable()
export class QueueProcessor {
  constructor(
    @InjectQueue('bull-queue') private readonly bullQueue: Queue,
    private readonly fileUploadService: FileUploadService,
    private readonly fileExportService: FileExportService,
  ) {}

  @Process(JOB_TYPES.FILE_UPLOAD)
  async handleUploadJob(job: Job<JobItem>) {
    console.log('Processing Bull JS upload job:', job.data);
    this.fileUploadService.handleFileUpload(job.data.message);
  }

  @Process(JOB_TYPES.FILE_UPLOAD_RETRY)
  async handleReTryJob(job: Job<JobItem>) {
    console.log('Processing Bull JS retry job:', job.data);
    this.fileUploadService.handleRetryJobQueueItem(job.data.message);
  }

  @Process(JOB_TYPES.FILE_EXPORT)
  async handleExportJob(job: Job<JobItem>) {
    console.log('Processing Bull JS export job:', job.data);
    this.fileExportService.handleUserExport(job.data.message);
  }
}
