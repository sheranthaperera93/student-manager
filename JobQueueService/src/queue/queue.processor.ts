import { Processor, Process, InjectQueue } from '@nestjs/bull';
import { Injectable, Logger, OnApplicationShutdown } from '@nestjs/common';
import { Job, Queue } from 'bull';
import { JOB_TYPES, JobItem } from 'src/core/constants';
import { FileUploadService } from 'src/file-upload/file-upload.service';

@Processor('bull-queue')
@Injectable()
export class QueueProcessor implements OnApplicationShutdown {
  constructor(
    @InjectQueue('bull-queue') private readonly bullQueue: Queue,
    private readonly fileUploadService: FileUploadService,
  ) {}

  @Process(JOB_TYPES.FILE_UPLOAD)
  handleJob(job: Job<JobItem>) {
    Logger.log('Processing Bull JS job:', job.data);
    this.fileUploadService.handleFileUpload(job.data.message);
  }

  async onApplicationShutdown() {
      await this.bullQueue.empty();
      await this.bullQueue.close();
  }
}
