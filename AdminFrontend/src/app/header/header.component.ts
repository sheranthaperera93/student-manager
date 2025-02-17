import { Component, OnDestroy, OnInit } from '@angular/core';
import { FileInfo } from '@progress/kendo-angular-upload';
import { bellIcon, SVGIcon, uploadIcon } from '@progress/kendo-svg-icons';
import { JOB_QUEUE_STATUS, JOB_STATUS, JOB_TYPES } from '../core/constants';
import { Notification } from '../model/notification.model';
import { NotificationService } from '../services/notification.service';
import { StudentService } from '../services/student.service';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: false,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public isUploadDialogVisible = false;
  public bellIcon: SVGIcon = bellIcon;
  public menuIcon: SVGIcon = uploadIcon;
  public showNotificationPopup = false;
  public hasFailedJobs: boolean = false;

  private readonly messageSubscription: Subscription;

  public jobQueue: Notification[] = [
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
    private readonly studentService: StudentService,
    private readonly socketService: SocketService
  ) {
    this.messageSubscription = this.socketService
      .on('message')
      .subscribe((data) => {
        if (data.status === JOB_QUEUE_STATUS.SUCCESS) {
          const job = data.job;
        }
        if (data.status === JOB_QUEUE_STATUS.FAILED) {
          const job = data.job;
        }
      });
  }

  ngOnInit(): void {
    this.fetchJobQueues();
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

  fetchJobQueues() {
    console.log("asadasd")
    this.notificationService.getJobQueueItems().subscribe({
      next: (data) => {
        this.jobQueue = data;
      },
    });
  }

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
          this.notificationService.showNotification(
            'success',
            'Upload job created successfully'
          );
        },
        error: (error) => {
          console.error('File upload failed', error);
          this.notificationService.showNotification(
            'error',
            'Failed to create student upload job. Please try again later.'
          );
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
