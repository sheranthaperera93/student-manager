import { Component, Input } from '@angular/core';
import { Notification } from '../../model/notification.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: false,
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  @Input() items: Notification[] = [];
  @Input() title: string = "";

  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Handles the action triggered by a notification.
   *
   * @param {Notification} action - The notification action to be handled.
   * @returns {void}
   */
  onActionHandler(action: Notification): void {
    console.log(action);
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
