import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { Course } from '../../model/course.model';
import { CourseService } from '../../services/course.service';
import { StudentService } from '../../services/student.service';
import { Student, UpdateStudent } from '../../model/student.model';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../services/notification.service';

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
  private studentId: number = 0;
  public studentEditFrm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    dateOfBirth: new FormControl(new Date(), Validators.required),
    courses: new FormControl([]),
  });
  private updateSubscription: Subscription = new Subscription();

  constructor(
    private readonly dialogRef: DialogRef,
    private readonly courseService: CourseService,
    private readonly studentService: StudentService,
    private readonly notificationService: NotificationService
  ) {}

  populateData = async (studentId: number) => {
    try {
      const studentDetails: Student = await this.getStudentDetails(studentId);
      this.allCourses = await this.getAllCourses();
      this.studentEditFrm.patchValue({
        name: studentDetails.name,
        email: studentDetails.email,
        dateOfBirth: new Date(studentDetails.date_of_birth),
        courses: studentDetails.courses,
      });
    } catch (error) {
      console.error(error);
    }
  };

  ngOnDestroy(): void {
    if (this.updateSubscription) this.updateSubscription.unsubscribe();
  }

  getStudentDetails = async (studentId: number): Promise<Student> => {
    this.studentId = studentId;
    return new Promise((resolve, reject) => {
      this.studentService.getStudentById(studentId).subscribe({
        next: (result: Student) => {
          resolve(result);
        },
        error: reject,
      });
    });
  };

  getAllCourses = async (): Promise<Course[]> => {
    return new Promise((resolve, reject) => {
      this.courseService.getCourses().subscribe({
        next: (data) => {
          resolve(data.data);
        },
        error: reject,
      });
    });
  };

  onCancel(): void {
    this.dialogRef.close();
  }

  onUpdate(): void {
    const updateData = new UpdateStudent();
    updateData.name = this.studentEditFrm.controls['name'].value;
    updateData.date_of_birth = this.studentEditFrm.controls['dateOfBirth'].value;
    updateData.email = this.studentEditFrm.controls['email'].value;
    updateData.courses = this.studentEditFrm.controls['courses'].value.map(
      (course: any) => parseInt(course.id)
    );

    this.updateSubscription = this.studentService
      .updateStudent(this.studentId, updateData)
      .subscribe({
        next: () => {
          this.notificationService.showNotification(
            'success',
            'Student updated successfully'
          );
          this.dialogRef.close('success');
        },
        error: (error) => {
          this.notificationService.showNotification('error', error.message, {
            hideAfter: 4000,
          });
        },
      });
  }
}
