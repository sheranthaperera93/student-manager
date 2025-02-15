import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { JOB_TYPES, JobItem } from 'src/core/constants';
import { FileUploadService } from 'src/file-processing/file-upload/file-upload.service';

@Processor('bull-queue')
@Injectable()
export class QueueProcessor {
  constructor(
    @InjectQueue('bull-queue') private readonly bullQueue: Queue,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Process(JOB_TYPES.FILE_UPLOAD)
  async handleJob(job: Job<JobItem>) {
    console.log('Processing Bull JS job:', job.data);
    await this.fileUploadService.handleFileUpload(job.data.message);
  }
}
