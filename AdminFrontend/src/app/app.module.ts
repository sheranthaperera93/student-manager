import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { UploadComponent } from './shared/upload/upload.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { NavigationModule } from '@progress/kendo-angular-navigation';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { IconsModule } from '@progress/kendo-angular-icons';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { UploadsModule } from '@progress/kendo-angular-upload';
import { GridModule } from '@progress/kendo-angular-grid';
import { AvatarModule, LayoutModule } from '@progress/kendo-angular-layout';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ListViewModule } from '@progress/kendo-angular-listview';

import { StudentService } from './services/student.service';
import { ConfirmationDialogComponent } from './shared/confirmation-dialog/confirmation-dialog.component';
import { StudentUpdateComponent } from './student-update/student-update.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PopupModule } from '@progress/kendo-angular-popup';
import { NotificationsComponent } from './shared/notifications/notifications.component';
import { JobItemCardComponent } from './shared/job-item-card/job-item-card.component';
import { StudentListComponent } from './student-list/student-list.component';
import { ExportPopupComponent } from './shared/export-popup/export-popup.component';
import { GraphQLModule } from './core/graphql/graphql.module';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    UploadComponent,
    StudentListComponent,
    ConfirmationDialogComponent,
    StudentUpdateComponent,
    NotificationsComponent,
    JobItemCardComponent,
    ExportPopupComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    NavigationModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutModule,
    ButtonsModule,
    DialogsModule,
    UploadsModule,
    IndicatorsModule,
    IconsModule,
    GridModule,
    InputsModule,
    LabelModule,
    DateInputsModule,
    PopupModule,
    ListViewModule,
    AvatarModule,
    GraphQLModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi()), StudentService],
  bootstrap: [AppComponent],
})
export class AppModule {}
