import { Component } from '@angular/core';
import {
  arrowRotateCwIcon,
  caretAltDownIcon,
  caretAltUpIcon,
  SVGIcon,
  uploadIcon,
} from '@progress/kendo-svg-icons';
import { NotificationService } from '../services/notification.service';
import { FileInfo } from '@progress/kendo-angular-upload';
import { StudentService } from '../services/student.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-student',
  standalone: false,
  templateUrl: './student.component.html',
  styleUrl: './student.component.scss',
})
export class StudentComponent {
  public showExportPopup: boolean = false;
  public isUploadDialogVisible = false;

  public carrotDownIcon: SVGIcon = caretAltDownIcon;
  public carrotUpIcon: SVGIcon = caretAltUpIcon;
  public uploadIcon: SVGIcon = uploadIcon;
  public refreshIcon: SVGIcon = arrowRotateCwIcon;

  private exportSubscription: Subscription = new Subscription();

  constructor(
    private readonly notificationService: NotificationService,
    private readonly studentService: StudentService
  ) {}

  ngOnDestroy(): void {
    if (this.exportSubscription) this.exportSubscription.unsubscribe();
  }

  refreshData = () => {
    this.studentService.refreshStudentList.next();
  };

  openUploadDialog(): void {
    this.isUploadDialogVisible = true;
  }

  closeUploadDialog(): void {
    this.isUploadDialogVisible = false;
  }

  onExportHandler(parameters: any): void {
    this.exportSubscription = this.studentService
      .exportData(parameters)
      .subscribe(() => {
        this.notificationService.showNotification(
          'success',
          'Export initiated successfully'
        );
      });
    this.showExportPopup = false;
  }

  uploadFile(files: FileInfo[]): void {
    if (files?.length > 0) {
      this.studentService
        .uploadFile(files.map((file) => file.rawFile!))
        .subscribe({
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
}
