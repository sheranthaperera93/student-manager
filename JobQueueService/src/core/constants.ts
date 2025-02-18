export interface JobItem {
  type: string;
  message: string;
}

export enum JOB_TYPES {
  FILE_UPLOAD = 'file_upload',
}

export interface JobData {
  filePath: string,
  fileName: string,
}

export enum JOB_QUEUE_STATUS {
  PENDING = 0,
  SUCCESS = 1,
  FAILED = 2,
}

export enum JOB_TYPE {
  UPLOADS = 1,
  EXPORTS = 2
}