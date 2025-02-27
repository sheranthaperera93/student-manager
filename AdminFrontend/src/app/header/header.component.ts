import { Component, OnDestroy, OnInit } from '@angular/core';
import { FileInfo } from '@progress/kendo-angular-upload';
import { bellIcon, SVGIcon, uploadIcon } from '@progress/kendo-svg-icons';
import { JOB_QUEUE_STATUS, JOB_TYPES, JobQueueItem } from '../core/constants';
import { Notification } from '../model/notification.model';
import { NotificationService } from '../services/notification.service';
import { StudentService } from '../services/student.service';
import { SocketService } from '../services/socket.service';
import { Subscription } from 'rxjs';
import { UtilService } from '../services/util.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: false,
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  public isUploadDialogVisible = false;
  public bellIcon: SVGIcon = bellIcon;
  public uploadIcon: SVGIcon = uploadIcon;
  public showNotificationPopup = false;
  public hasFailedJobs: boolean = false;

  private readonly messageSubscription: Subscription;

  public jobQueue: Notification[] = [];

  constructor(
    private readonly notificationService: NotificationService,
    private readonly studentService: StudentService,
    private readonly socketService: SocketService,
    private readonly utilService: UtilService
  ) {
    this.messageSubscription = this.socketService
      .on('message')
      .subscribe((data) => {
        const parsedMsg = JSON.parse(data);
        if (parsedMsg.type === JOB_TYPES.UPLOAD) {
          this.handleOnUploadJobChange(parsedMsg);
        } else if (parsedMsg.type === JOB_TYPES.EXPORT) {
          this.handleOnExportJobChange(parsedMsg);
        }
      });
  }

  handleOnUploadJobChange(parsedMsg: {
    job: JobQueueItem;
    type: string;
    status: number;
  }) {
    switch (parsedMsg.status) {
      case JOB_QUEUE_STATUS.SUCCESS:
        this.notificationService.showNotification(
          'success',
          'User upload success'
        );
        break;
      case JOB_QUEUE_STATUS.FAILED:
        this.notificationService.showNotification(
          'error',
          'User upload failed. Try again later'
        );
        break;
      default:
        console.warn('Unknown job status:', parsedMsg.status);
    }
    this.fetchJobQueues();
    this.studentService.refreshStudentList.next();
  }

  handleOnExportJobChange(parsedMsg: {
    job: JobQueueItem;
    type: string;
    status: number;
  }) {
    switch (parsedMsg.status) {
      case JOB_QUEUE_STATUS.SUCCESS:
        this.notificationService.showNotification(
          'success',
          'User export success'
        );
        break;
      case JOB_QUEUE_STATUS.FAILED:
        this.notificationService.showNotification(
          'error',
          'User export failed. Try again later'
        );
        break;
      default:
        console.warn('Unknown job status:', parsedMsg.status);
    }
    this.fetchJobQueues();
  }

  ngOnInit(): void {
    this.fetchJobQueues();
  }

  ngOnDestroy(): void {
    this.messageSubscription.unsubscribe();
  }

  fetchJobQueues() {
    this.notificationService.getJobQueueItems().subscribe({
      next: (data: JobQueueItem[]) => {
        this.jobQueue = data.map(
          (element: JobQueueItem): Notification => ({
            id: element.id,
            status: this.utilService.getStatus(element.status),
            type: this.utilService.getType(element.type),
            date:
              element.status === JOB_QUEUE_STATUS.SUCCESS
                ? new Date(element.jobCompleteDate)
                : new Date(element.createdDate),
            name: this.utilService.getName(element.type, element.status),
          })
        );
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
  uploadFile(files: FileInfo[]): void {
    if (files?.length > 0) {
      this.studentService.uploadFile(files.map((file) => file.rawFile!)).subscribe({
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
          this.isUploadDialogVisible = false;
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
