import { Injectable } from '@angular/core';
import { Notification } from '../model/notification.model';
import { JOB_STATUS, JobQueueItem } from '../core/constants';
import gql from 'graphql-tag';
import {
  NotificationService as KNotificationService,
  NotificationSettings,
} from '@progress/kendo-angular-notification';
import { Apollo } from 'apollo-angular';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(
    private readonly notificationService: KNotificationService,
    private readonly apollo: Apollo
  ) {}

  getJobQueueItems = (): Observable<JobQueueItem[]> => {
    return this.apollo
      .watchQuery<{ getJobQueueItems: JobQueueItem[] }>({
        query: gql`
          query getJobQueueItems {
            getJobQueueItems {
              id
              jobData
              status
              type
              createdDate
              jobCompleteDate
            }
          }
        `,
        fetchPolicy: 'cache-and-network',
      })
      .valueChanges.pipe(
        map((result) => result.data.getJobQueueItems),
        catchError((error) => {
          console.error('Error fetching job queue items', error);
          return of([]); // Return an empty array in case of error
        })
      );
  };

  /**
   * Retrieves the count of failed jobs from the provided job queue.
   *
   * @param {Notification[]} jobQueue - The array of Notification objects representing the job queue.
   * @returns {number} The number of jobs in the queue that have a status of FAILED.
   */
  getFailedJobCount(jobQueue: Notification[]): number {
    return jobQueue.filter((job) => job.status === JOB_STATUS.FAILED).length;
  }

  /**
   * Displays a notification with the specified type and message.
   *
   * @param type - The type of notification to display. Can be 'success', 'error', 'warning', 'info', or 'default'.
   * @param message - The message content of the notification.
   *
   * The notification will be styled according to the type provided:
   * - 'success': Displays a success notification with an icon.
   * - 'error': Displays an error notification with an icon.
   * - 'warning': Displays a warning notification with an icon.
   * - 'info': Displays an info notification with an icon.
   * - 'default': Displays a default notification without any specific style but with an icon.
   */
  showNotification(
    type: 'success' | 'error' | 'warning' | 'info' | 'default',
    message: string
  ) {
    const typeStyles: {
      [key: string]: {
        style: 'success' | 'error' | 'warning' | 'info' | 'none';
        icon: boolean;
      };
    } = {
      success: { style: 'success', icon: true },
      error: { style: 'error', icon: true },
      warning: { style: 'warning', icon: true },
      info: { style: 'info', icon: true },
      default: { style: 'none', icon: true },
    };

    const state: NotificationSettings = {
      content: message,
      type: typeStyles[type],
      position: {
        horizontal: 'right',
        vertical: 'bottom',
      },
      animation: { type: 'fade', duration: 500 },
      height: 50,
    };

    this.notificationService.show(state);
  }

  retryJobQueueItem = (jobId: number) => {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation retryJobQueueItem($id: ID!) {
            retryJobQueueItem(id: $id)
          }
        `,
        variables: {
          id: jobId,
        },
      })
      .pipe(
        map((result: any) => ({
          message: result.data.retryJobQueueItem,
          data: {},
        }))
      );
  };
}
