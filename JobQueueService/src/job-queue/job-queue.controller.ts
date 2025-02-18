import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response as ExpressResponse } from 'express';
import { JobQueueService } from './job-queue.service';

@Controller('job-queue')
export class JobQueueController {
  constructor(private readonly jobQueueService: JobQueueService) {}

  @Get('download/:fileName')
  getFile(
    @Param('fileName') fileName: string,
    @Res() res: ExpressResponse,
  ): void {
    const file: string = this.jobQueueService.getFile(fileName);
    res.sendFile(file);
  }
}
