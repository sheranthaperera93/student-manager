import { Component } from '@angular/core';
import { Course } from '../model/course.model';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
})
export class CourseListComponent {
  public gridData: Course[] = [];
  public loading: boolean = false;

  constructor(private readonly studentService: StudentService) {}

  fetchCourseList = (studentId: number) => {
    this.loading = true;
    this.studentService.getCoursesForStudentId(studentId).subscribe({
      next: (result: Course[]) => {
        this.gridData = result;
      },
      error: (error: any) => {
        console.error('Error fetching course list:', error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  };
}
