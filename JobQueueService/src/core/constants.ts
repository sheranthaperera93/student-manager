export interface JobItem {
  type: string;
  message: string;
}

export enum JOB_TYPES {
  FILE_UPLOAD = 'file_upload',
}

export enum JOB_QUEUE_STATUS {
  PENDING = 0,
  IN_PROGRESS = 1,
  SUCCESS = 3,
  FAILED = 2,
}

export interface UserUploadRecord {
  name: string;
  email: string;
  dateOfBirth: string;
}
