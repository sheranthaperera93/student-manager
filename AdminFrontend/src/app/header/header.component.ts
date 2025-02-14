import { Component } from '@angular/core';
import { FileInfo } from '@progress/kendo-angular-upload';
import { bellIcon, SVGIcon, uploadIcon } from '@progress/kendo-svg-icons';
import { JOB_STATUS, JOB_TYPES } from '../core/constants';
import { Notification } from '../model/notification.model';
import { NotificationService } from '../services/notification.service';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: false,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  public isUploadDialogVisible = false;
  public bellIcon: SVGIcon = bellIcon;
  public menuIcon: SVGIcon = uploadIcon;
  public showNotificationPopup = false;
  public hasFailedJobs: boolean = false;

  jobQueue: Notification[] = [
    {
      id: 1,
      name: 'Success',
      date: new Date(),
      status: JOB_STATUS.SUCCESS,
      type: JOB_TYPES.UPLOAD,
    },
    {
      id: 2,
      name: 'Failed',
      date: new Date(),
      status: JOB_STATUS.FAILED,
      type: JOB_TYPES.UPLOAD,
    },
    {
      id: 3,
      name: 'Pending',
      date: new Date(),
      status: JOB_STATUS.PENDING,
      type: JOB_TYPES.UPLOAD,
    },
    {
      id: 4,
      name: 'Download Ready',
      date: new Date(),
      status: JOB_STATUS.SUCCESS,
      type: JOB_TYPES.EXPORT,
    },
  ];

  constructor(
    private readonly notificationService: NotificationService,
    private readonly studentService: StudentService
  ) {}

  /**
   * Opens the upload dialog by setting the visibility flag to true.
   * This method is used to display the upload dialog in the UI.
   */
  openUploadDialog(): void {
    this.isUploadDialogVisible = true;
  }

  /**
   * Closes the upload dialog by setting the visibility flag to false.
   */
  closeUploadDialog(): void {
    this.isUploadDialogVisible = false;
  }

  /**
   * Uploads a file and logs the file information to the console.
   * Hides the upload dialog after the file is uploaded.
   *
   * @param file - The file information to be uploaded. It can be of type FileInfo or undefined.
   */
  uploadFile(file: FileInfo | undefined): void {
    if (file) {
      this.studentService.uploadFile(file.rawFile as File).subscribe({
        next: (result) => {
          console.log('File upload successful', result);
        },
        error: (error) => {
          console.error('File upload failed', error);
        },
        complete: () => {
          this.isUploadDialogVisible = false;
        },
      });
    }
  }

  /**
   * Retrieves the count of failed jobs from the job queue.
   *
   * @returns {number} The number of failed jobs.
   */
  getFailedJobCount(): number {
    return this.notificationService.getFailedJobCount(this.jobQueue);
  }
}
