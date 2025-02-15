export enum JOB_QUEUE_STATUS {
  PENDING = 0,
  IN_PROGRESS = 1,
  SUCCESS = 3,
  FAILED = 2,
}

export interface JobData {
    filePath: string,
    fileName: string,
}
