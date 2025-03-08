import { Component } from '@angular/core';
import { Student } from '../../model/student.model';
import { CourseService } from '../../services/course.service';

@Component({
  selector: 'app-course-students',
  standalone: false,
  templateUrl: './course-students.component.html',
  styleUrl: './course-students.component.scss',
})
export class CourseStudentsComponent {
  public gridData: Student[] = [];
  public loading: boolean = false;

  constructor(private readonly courseService: CourseService) {}

  fetchStudentList = (courseId: number) => {
    this.loading = true;
    this.courseService.getStudentsForCourse(courseId).subscribe({
      next: (result: Student[]) => {
        this.gridData = result;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error fetching student list:', error);
        this.loading = false;
      },
      complete: () => {
        this.loading = false;
      },
    });
  };
}
