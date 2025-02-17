import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JOB_QUEUE_STATUS, JOB_TYPE, JobData } from 'src/core/constants';
import { JobQueue } from 'src/entities/job_queue.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JobQueueService {
  constructor(
    @InjectRepository(JobQueue)
    private readonly jobQueueRepository: Repository<JobQueue>,
  ) {}

  /**
   * Creates a new upload job and saves it to the job queue repository.
   *
   * @param filePath - The path of the file to be uploaded.
   * @param fileName - The name of the file to be uploaded.
   * @param type     - The type of the job (1 = UPLOADS, 2 = EXPORTS)
   * @returns A promise that resolves to the created JobQueue object.
   */
  createUploadJob = async (
    filePath: string,
    fileName: string,
    type: JOB_TYPE,
  ): Promise<JobQueue> => {
    let jobQueue = new JobQueue();
    jobQueue.createdDate = new Date();
    jobQueue.status = JOB_QUEUE_STATUS.PENDING;
    let tmpJobData: JobData = {
      filePath,
      fileName,
    };
    jobQueue.type = type;
    jobQueue.jobData = JSON.stringify(tmpJobData);
    Logger.log('Inserting job queue item to DB');
    return await this.jobQueueRepository.save(jobQueue);
  };

  /**
   * Updates the status of a job in the job queue.
   *
   * @param {string} message - The message containing the job ID and status in JSON format.
   * @returns {Promise<void>} - A promise that resolves when the job status is updated.
   *
   * The message should be a JSON string with the following structure:
   * {
   *   "jobId": string,
   *   "status": JOB_QUEUE_STATUS
   * }
   *
   * The function performs the following actions:
   * - Parses the message to extract the job ID and status.
   * - Finds the job item in the job queue repository using the job ID.
   * - If the job item is found and the status is `SUCCESS`, updates the job's completion date and status to `SUCCESS`.
   * - If the job item is found and the status is `FAILED`, updates the job's completion date and status to `FAILED`.
   * - If the job item is not found or the status is invalid, logs an error message.
   *
   * @throws {Error} If the message cannot be parsed or if the job queue repository operations fail.
   */
  async updateJobStatus(message: string): Promise<void> {
    const { job, status } = JSON.parse(message);
    const jobItem = await this.jobQueueRepository.findOneBy({ id: job.id });
    if (jobItem && status === JOB_QUEUE_STATUS.SUCCESS) {
      this.jobQueueRepository.update(
        { id: job.id },
        { jobCompleteDate: new Date(), status: JOB_QUEUE_STATUS.SUCCESS },
      );
    } else if (jobItem && status === JOB_QUEUE_STATUS.FAILED) {
      this.jobQueueRepository.update(
        { id: job.id },
        { jobCompleteDate: new Date(), status: JOB_QUEUE_STATUS.FAILED },
      );
    } else {
      Logger.error('Failed to update job status. Invalid JOB ID : ', {
        jobId: job.id,
        status,
      });
    }
  }

  async findAll(): Promise<JobQueue[]> {
    return await this.jobQueueRepository.find();
  }
}
