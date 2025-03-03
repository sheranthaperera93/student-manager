import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { Course } from '../../model/course.model';
import { CourseService } from '../../services/course.service';
import { StudentService } from '../../services/student.service';
import { Student } from '../../model/student.model';

@Component({
  selector: 'app-student-update',
  standalone: false,
  templateUrl: './student-update.component.html',
  styleUrl: './student-update.component.scss',
})
export class StudentUpdateComponent {
  public dobMin: Date = new Date(1917, 0, 1);
  public dobMax: Date = new Date();
  public allCourses: Course[] = [];
  public editForm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    dateOfBirth: new FormControl(new Date(), Validators.required),
    courses: new FormControl([]),
  });

  constructor(
    private readonly dialogRef: DialogRef,
    private readonly courseService: CourseService,
    private readonly studentService: StudentService
  ) {}

  populateData = async (studentId: number) => {
    const studentDetails: Student = await this.getStudentDetails(studentId);
    this.allCourses = await this.getAllCourses();
    this.editForm.patchValue({
      name: studentDetails.name,
      email: studentDetails.email,
      dateOfBirth: new Date(studentDetails.date_of_birth),
      courses: studentDetails.courses,
    });
  };

  getStudentDetails = async (studentId: number): Promise<Student> => {
    return new Promise((resolve, reject) => {
      this.studentService.getStudentById(studentId).subscribe({
        next: (result: Student) => {
          resolve(result);
        },
        error: (error) => reject,
      });
    });
  };

  getAllCourses = async (): Promise<Course[]> => {
    return new Promise((resolve, reject) => {
      this.courseService.getCourses().subscribe({
        next: (data) => {
          resolve(data);
        },
        error: (error) => reject,
      });
    });
  };

  onCancel(): void {
    this.dialogRef.close();
  }

  onUpdate(): void {
    this.dialogRef.close('success');
  }
}
