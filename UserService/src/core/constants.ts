export interface JobData {
  filePath: string;
  fileName: string;
}

export enum JOB_QUEUE_STATUS {
  PENDING = 0,
  SUCCESS = 1,
  FAILED = 2,
}
