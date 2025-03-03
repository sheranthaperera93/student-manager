import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KendoUIModule } from '../theme/kendo-ui/kendo-ui.module';
import { CourseComponent } from './course.component';
import { CourseRoutingModule } from './course-routing.module';
import { CourseListComponent } from './course-list/course-list.component';

@NgModule({
  declarations: [CourseListComponent, CourseComponent],
  imports: [CourseRoutingModule, CommonModule, KendoUIModule],
})
export class CourseModule {}
