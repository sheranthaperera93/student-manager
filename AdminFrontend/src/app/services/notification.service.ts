import { Injectable } from '@angular/core';
import { Notification } from '../model/notification.model';
import { JOB_STATUS } from '../core/constants';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor() {}

  /**
   * Retrieves the count of failed jobs from the provided job queue.
   *
   * @param {Notification[]} jobQueue - The array of Notification objects representing the job queue.
   * @returns {number} The number of jobs in the queue that have a status of FAILED.
   */
  getFailedJobCount(jobQueue: Notification[]): number {
    return jobQueue.filter((job) => job.status === JOB_STATUS.FAILED).length;
  }
}
