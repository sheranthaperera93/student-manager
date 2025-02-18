import { Component, OnDestroy, OnInit } from '@angular/core';
import { FileInfo } from '@progress/kendo-angular-upload';
import { bellIcon, SVGIcon, uploadIcon } from '@progress/kendo-svg-icons';
import {
  JOB_QUEUE_STATUS,
  JOB_QUEUE_TYPES,
  JOB_STATUS,
  JOB_TYPES,
  JobQueueItem,
} from '../core/constants';
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

  // public jobQueue: Notification[] = [{
  //   id: 1,
  //   name: 'Success',
  //   date: new Date(),
  //   status: JOB_STATUS.SUCCESS,
  //   type: JOB_TYPES.UPLOAD,
  // },
  // {
  //   id: 2,
  //   name: 'Failed',
  //   date: new Date(),
  //   status: JOB_STATUS.FAILED,
  //   type: JOB_TYPES.UPLOAD,
  // },
  // {
  //   id: 3,
  //   name: 'Pending',
  //   date: new Date(),
  //   status: JOB_STATUS.PENDING,
  //   type: JOB_TYPES.UPLOAD,
  // },
  // {
  //   id: 4,
  //   name: 'Download Ready',
  //   date: new Date(),
  //   status: JOB_STATUS.SUCCESS,
  //   type: JOB_TYPES.EXPORT,
  // }],

  public jobQueue: Notification[] = [];

  constructor(
    private readonly notificationService: NotificationService,
    private readonly studentService: StudentService,
    private readonly socketService: SocketService
  ) {
    this.messageSubscription = this.socketService
      .on('message')
      .subscribe((data) => {
        console.log('Message from the heavens ', data);
        const parsedMsg = JSON.parse(data);
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
        this.studentService.refreshStudentList.next('reload-list')
      });
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
            status: this.getStatus(element.status),
            type: this.getType(element.type),
            date:
              element.status === JOB_QUEUE_STATUS.SUCCESS
                ? new Date(element.jobCompleteDate)
                : new Date(element.createdDate),
            name: this.getName(element.type, element.status),
          })
        );
      },
    });
  }

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
    if(type === JOB_QUEUE_TYPES.FILE_UPLOAD && status === JOB_QUEUE_STATUS.SUCCESS){
      return "User upload success";
    } else if (type === JOB_QUEUE_TYPES.FILE_UPLOAD && status === JOB_QUEUE_STATUS.FAILED) {
      return "User upload failed. Try again later";
    } else {
      return "Unknown Notification"
    }
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
