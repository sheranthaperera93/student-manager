import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: '/students', pathMatch: 'full' },
  { path: 'students', loadChildren: () => import('./student/student-routing.module').then(m => m.StudentRoutingModule) },
  { path: 'courses', loadChildren: () => import('./course/course-routing.module').then(m => m.CourseRoutingModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
