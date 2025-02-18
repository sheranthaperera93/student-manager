import { Component, Input } from '@angular/core';
import { Notification } from '../../model/notification.model';
import { NotificationService } from '../../services/notification.service';
import { JOB_STATUS, JOB_TYPES } from '../../core/constants';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  @Input() items: Notification[] = [];
  @Input() title: string = '';

  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Handles the item triggered by a notification.
   *
   * @param {Notification} item - The notification action to be handled.
   * @returns {void}
   */
  onActionHandler(item: Notification): void {
    console.log(item);
    if (item.status === JOB_STATUS.FAILED && item.type === JOB_TYPES.UPLOAD) {
      this.notificationService.retryJobQueueItem(item.id).subscribe(() => {
        this.notificationService.showNotification(
          'success',
          'Re-try job initiated successfully'
        );
      });
    }
  }

  /**
   * Retrieves the count of failed jobs from the notification service.
   *
   * @returns {number} The number of failed jobs.
   */
  getFailedJobCount(): number {
    return this.notificationService.getFailedJobCount(this.items);
  }
}
