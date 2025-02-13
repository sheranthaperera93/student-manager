import { JOB_STATUS, JOB_TYPES } from '../core/constants';

export class Notification {
  id: number = 0;
  name: string = '';
  status: JOB_STATUS = JOB_STATUS.PENDING;
  date: Date = new Date();
  type: JOB_TYPES = JOB_TYPES.UPLOAD;
}
