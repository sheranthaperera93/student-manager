import { Component, EventEmitter, Output } from '@angular/core';
import {
  FileInfo,
  FileRestrictions,
  SelectEvent,
} from '@progress/kendo-angular-upload';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-upload',
  standalone: false,
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss',
})
export class UploadComponent {
  @Output() closeDialog = new EventEmitter<void>();
  @Output() triggerUpload = new EventEmitter<FileInfo[]>();

  uploadRestrictions: FileRestrictions = {
    allowedExtensions: ['.xls', '.xlsx'],
    maxFileSize: 5000000, // 5 MB in bytes
  };
  selectedFiles: FileInfo[] | undefined = undefined;

  constructor(private readonly notificationService: NotificationService) {}

  /**
   * Handles the file selection event.
   *
   * This method is triggered when a file is selected. It checks the file extension
   * to ensure it is an Excel file (.xls or .xlsx). If the file is valid, it sets
   * the selected file. Otherwise, it alerts the user and prevents the default
   * action.
   *
   * @param e - The file selection event containing the selected files.
   */
  onFileSelected(e: SelectEvent): void {
    const files = e.files;
    for (const file of files) {
      if (file.validationErrors) {
        this.notificationService.showNotification(
          'error',
          'Invalid file type. Please select an Excel file.'
        );
        this.selectedFiles = undefined;
        e.preventDefault();
        return;
      }
    }
    this.selectedFiles = files;
  }

  /**
   * Handles the event when a file is removed.
   * Sets the selected file to undefined.
   */
  onFileRemoved(): void {
    this.selectedFiles = undefined;
  }

  /**
   * Emits an event to close the dialog.
   *
   * This method triggers the `closeDialog` event emitter, which is used to signal that the dialog should be closed.
   *
   * @returns {void}
   */
  close(): void {
    this.closeDialog.emit();
  }

  /**
   * Uploads the selected file if one is chosen.
   * Emits the selected file through the `triggerUpload` event emitter
   * and then closes the upload component.
   *
   * @remarks
   * This method checks if a file is selected before proceeding with the upload.
   * If a file is selected, it triggers the upload process and closes the component.
   */
  uploadFile(): void {
    if (this.selectedFiles) {
      this.triggerUpload.emit(this.selectedFiles);
    }
  }
}
