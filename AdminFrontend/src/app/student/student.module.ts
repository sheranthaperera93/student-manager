import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { StudentListComponent } from './student-list/student-list.component';
import { StudentUpdateComponent } from './student-update/student-update.component';
import { KendoUIModule } from '../theme/kendo-ui/kendo-ui.module';
import { StudentService } from '../services/student.service';
import { SharedModule } from '../shared/shared.module';
import { CourseModule } from '../course/course.module';
import { StudentComponent } from './student.component';
import { StudentRoutingModule } from './student-routing.module';

@NgModule({
  declarations: [
    StudentListComponent,
    StudentUpdateComponent,
    StudentComponent,
  ],
  imports: [
    StudentRoutingModule,
    CommonModule,
    KendoUIModule,
    SharedModule,
    CourseModule,
    ReactiveFormsModule,
  ],
  providers: [StudentService],
})
export class StudentModule {}
