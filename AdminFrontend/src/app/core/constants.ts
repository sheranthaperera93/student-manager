export enum DIALOG_ACTIONS {
  CANCEL = 'cancel',
  YES = 'yes',
  NO = 'no',
}

export enum JOB_STATUS {
  SUCCESS = 'success',
  FAILED = 'failed',
  PENDING = 'pending',
}

export enum JOB_QUEUE_STATUS {
  PENDING = 0,
  SUCCESS = 1,
  FAILED = 2,
}

export enum JOB_QUEUE_TYPES {
  FILE_UPLOAD = 1,
  FILE_EXPORT = 2,
}

export interface ExportParameters {
  ageRange: {from: number, to: number};
}

export enum JOB_TYPES {
  UPLOAD = 'upload',
  EXPORT = 'export',
}

export interface JobQueueItem {
  createdDate: string;
  id: number;
  jobCompleteDate: string;
  jobData: string;
  status: number;
  type: number;
}
