import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PopupModule } from '@progress/kendo-angular-popup';
import { NavigationModule } from '@progress/kendo-angular-navigation';
import { IndicatorsModule } from '@progress/kendo-angular-indicators';
import { IconsModule } from '@progress/kendo-angular-icons';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogsModule } from '@progress/kendo-angular-dialog';
import { UploadsModule } from '@progress/kendo-angular-upload';
import { GridModule } from '@progress/kendo-angular-grid';
import { AvatarModule, LayoutModule } from '@progress/kendo-angular-layout';
import { InputsModule, FormFieldModule } from '@progress/kendo-angular-inputs';
import { LabelModule } from '@progress/kendo-angular-label';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { ListViewModule } from '@progress/kendo-angular-listview';
import { NotificationModule } from '@progress/kendo-angular-notification';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    NavigationModule,
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
    NotificationModule,
    FormFieldModule,
  ],
  exports: [
    NavigationModule,
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
    NotificationModule,
    FormFieldModule,
  ],
})
export class KendoUIModule {}
