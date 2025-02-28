import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { UploadComponent } from './upload/upload.component';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { JobItemCardComponent } from './job-item-card/job-item-card.component';
import { ExportPopupComponent } from './export-popup/export-popup.component';
import { KendoUIModule } from '../theme/kendo-ui/kendo-ui.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    HeaderComponent,
    UploadComponent,
    ConfirmationDialogComponent,
    NotificationsComponent,
    JobItemCardComponent,
    ExportPopupComponent,
  ],
  imports: [CommonModule, KendoUIModule, FormsModule],
  exports: [
    HeaderComponent,
    UploadComponent,
    ConfirmationDialogComponent,
    NotificationsComponent,
    JobItemCardComponent,
    ExportPopupComponent,
  ],
})
export class SharedModule {}
