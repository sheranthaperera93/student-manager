import { Component } from '@angular/core';
import { Course } from '../../model/course.model';
import { StudentService } from '../../services/student.service';

@Component({
  selector: 'app-student-courses',
  standalone: false,
  templateUrl: './student-courses.component.html',
  styleUrl: './student-courses.component.scss',
})
export class StudentCoursesComponent {
  public gridData: Course[] = [];
  public loading: boolean = false;

  constructor(private readonly studentService: StudentService) {}

  fetchCourseList = (studentId: number) => {
    this.loading = true;
    this.studentService.getCoursesForStudentId(studentId).subscribe({
      next: (result: Course[]) => {
        this.gridData = result;
        this.loading = false;
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
