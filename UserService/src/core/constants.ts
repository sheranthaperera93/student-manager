export enum JOB_QUEUE_STATUS {
  PENDING = 0,
  SUCCESS = 2,
  FAILED = 1,
}

export interface JobData {
    filePath: string,
}
