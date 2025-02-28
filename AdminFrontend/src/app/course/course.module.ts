import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseListComponent } from './course-list/course-list.component';
import { KendoUIModule } from '../theme/kendo-ui/kendo-ui.module';
import { CourseComponent } from './course.component';
import { CourseRoutingModule } from './course-routing.module';

@NgModule({
  declarations: [CourseListComponent, CourseComponent],
  imports: [CourseRoutingModule, CommonModule, KendoUIModule],
  exports: [CourseListComponent],
})
export class CourseModule {}
