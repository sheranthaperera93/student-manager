import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Notification } from '../../model/notification.model';
import { JOB_STATUS, JOB_TYPES } from '../../core/constants';
import { arrowRotateCwIcon, SVGIcon, downloadIcon } from '@progress/kendo-svg-icons';

@Component({
  selector: 'app-job-item-card',
  standalone: false,
  templateUrl: './job-item-card.component.html',
  styleUrl: './job-item-card.component.scss',
})
export class JobItemCardComponent {
  @Input() public item!: Notification;
  @Input() public borderTop!: boolean;
  @Output() public action: EventEmitter<Notification> =
    new EventEmitter<Notification>();
  public JOB_STATUS = JOB_STATUS;
  public JOB_TYPES = JOB_TYPES;
  public retryIcon: SVGIcon = arrowRotateCwIcon;
  public downloadIcon: SVGIcon = downloadIcon;

  /**
   * Returns the URL of the image corresponding to the given job status.
   *
   * @param {JOB_STATUS} jobStatus - The status of the job.
   * @returns {string} The URL of the image representing the job status.
   */
  public getImageUrl(jobStatus: JOB_STATUS): string {
    let imageUrl = '';
    switch (jobStatus) {
      case JOB_STATUS.SUCCESS:
        imageUrl = 'assets/icons/job-complete.png';
        break;
      case JOB_STATUS.FAILED:
        imageUrl = 'assets/icons/job-failed.png';
        break;
      case JOB_STATUS.PENDING:
        imageUrl = 'assets/icons/job-pending.png';
        break;
    }
    return imageUrl;
  }

  /**
   * Triggers an action based on the provided notification item.
   * 
   * @param item - The notification item that will be used to trigger the action.
   * @returns void
   */
  triggerAction = (item: Notification): void => {
    this.action.emit(item);
  };

  /**
   * Formats the given job type name into a more user-friendly string.
   *
   * @param name - The job type name to format.
   * @returns The formatted job type name. Returns 'Uploads' for `JOB_TYPES.UPLOAD`,
   * 'Downloads' for `JOB_TYPES.EXPORT`, and 'Undefined' for any other job type.
   */
  formatName(name: string): string {
    let formattedName = '';
    switch (name) {
      case JOB_TYPES.UPLOAD:
        formattedName = 'Uploads';
        break;
      case JOB_TYPES.EXPORT:
        formattedName = 'Downloads';
        break;
      default:
        formattedName = 'Undefined';
        break;
    }
    return formattedName;
  }
}
