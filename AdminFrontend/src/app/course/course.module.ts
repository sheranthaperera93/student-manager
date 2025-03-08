import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KendoUIModule } from '../theme/kendo-ui/kendo-ui.module';
import { CourseComponent } from './course.component';
import { CourseRoutingModule } from './course-routing.module';
import { CourseListComponent } from './course-list/course-list.component';
import { CourseUpdateComponent } from './course-update/course-update.component';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CourseStudentsComponent } from './course-students/course-students.component';

@NgModule({
  declarations: [CourseListComponent, CourseComponent, CourseUpdateComponent, CourseStudentsComponent],
  imports: [CourseRoutingModule, CommonModule, KendoUIModule, SharedModule, ReactiveFormsModule],
})
export class CourseModule {}
