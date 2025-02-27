import { Injectable } from '@angular/core';
import dayjs from 'dayjs';
import { JOB_QUEUE_STATUS, JOB_QUEUE_TYPES, JOB_STATUS, JOB_TYPES } from '../core/constants';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor() {}

  /**
   * Calculates the age based on the given date of birth.
   *
   * @param dateOfBirth - The date of birth to calculate the age from.
   * @returns The calculated age in years.
   */
  calculateAge(dateOfBirth: Date): number {
    const birthDate = dayjs(dateOfBirth);
    const currentDate = dayjs();
    const age = currentDate.diff(birthDate, 'year');
    return age;
  }

  formatDate = (date: Date, format: string) => {
    return dayjs(date).format(format);
  };

  getStatus = (status: JOB_QUEUE_STATUS): JOB_STATUS => {
      switch (status) {
        case JOB_QUEUE_STATUS.SUCCESS:
          return JOB_STATUS.SUCCESS;
        case JOB_QUEUE_STATUS.PENDING:
          return JOB_STATUS.PENDING;
        default:
          return JOB_STATUS.FAILED;
      }
    };
  
    getType = (type: JOB_QUEUE_TYPES): JOB_TYPES => {
      return type === JOB_QUEUE_TYPES.FILE_UPLOAD
        ? JOB_TYPES.UPLOAD
        : JOB_TYPES.EXPORT;
    };
  
    getName = (type: JOB_QUEUE_TYPES, status: JOB_QUEUE_STATUS) => {
      if (
        type === JOB_QUEUE_TYPES.FILE_UPLOAD &&
        status === JOB_QUEUE_STATUS.SUCCESS
      ) {
        return 'User upload success';
      } else if (
        type === JOB_QUEUE_TYPES.FILE_UPLOAD &&
        status === JOB_QUEUE_STATUS.FAILED
      ) {
        return 'User upload failed. Try again later';
      } else if (
        type === JOB_QUEUE_TYPES.FILE_UPLOAD &&
        status === JOB_QUEUE_STATUS.PENDING
      ) {
        return 'User upload pending';
      } else if (
        type === JOB_QUEUE_TYPES.FILE_EXPORT &&
        status === JOB_QUEUE_STATUS.SUCCESS
      ) {
        return 'User export success';
      } else if (
        type === JOB_QUEUE_TYPES.FILE_EXPORT &&
        status === JOB_QUEUE_STATUS.FAILED
      ) {
        return 'User export failed. Try again later';
      } else if (
        type === JOB_QUEUE_TYPES.FILE_EXPORT &&
        status === JOB_QUEUE_STATUS.PENDING
      ) {
        return 'User export pending';
      } else {
        return 'Unknown Notification';
      }
    };
}
