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

export interface ExportParameters {
  ageRange: [number, number];
}

export enum JOB_TYPES {
  UPLOAD = 'upload',
  EXPORT = 'export',
};