import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { StudentListComponent } from './student-list/student-list.component';
import { StudentUpdateComponent } from './student-update/student-update.component';
import { KendoUIModule } from '../theme/kendo-ui/kendo-ui.module';
import { StudentService } from '../services/student.service';
import { SharedModule } from '../shared/shared.module';
import { StudentComponent } from './student.component';
import { StudentRoutingModule } from './student-routing.module';
import { StudentCoursesComponent } from './student-courses/student-courses.component';
import { StudentSearchComponent } from './student-search/student-search.component';

@NgModule({
  declarations: [
    StudentListComponent,
    StudentUpdateComponent,
    StudentComponent,
    StudentCoursesComponent,
    StudentSearchComponent
  ],
  imports: [
    StudentRoutingModule,
    CommonModule,
    KendoUIModule,
    SharedModule,
    ReactiveFormsModule,
  ],
  providers: [StudentService],
})
export class StudentModule {}
