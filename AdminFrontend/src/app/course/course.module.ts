import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KendoUIModule } from '../theme/kendo-ui/kendo-ui.module';
import { CourseComponent } from './course.component';
import { CourseRoutingModule } from './course-routing.module';

@NgModule({
  declarations: [CourseComponent],
  imports: [CourseRoutingModule, CommonModule, KendoUIModule],
})
export class CourseModule {}
