import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DialogRef } from '@progress/kendo-angular-dialog';
import { Course, UpdateCourse } from '../../model/course.model';
import { Subscription } from 'rxjs';
import { CourseService } from '../../services/course.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-course-update',
  standalone: false,
  templateUrl: './course-update.component.html',
  styleUrl: './course-update.component.scss',
})
export class CourseUpdateComponent {
  private updateSubscription: Subscription = new Subscription();
  private courseId: number = 0;
  public courseEditFrm: FormGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl('', [Validators.required]),
  });

  constructor(
    private readonly dialogRef: DialogRef,
    private readonly courseService: CourseService,
    private readonly notificationService: NotificationService
  ) {}

  populateCourseDetails = (course: Course) => {
    this.courseEditFrm.patchValue({
      name: course.name,
      description: course.description,
    });
    this.courseId = course.id;
  };

  onCancel(): void {
    this.dialogRef.close();
  }

  onDestroy(): void {
    if (this.updateSubscription) this.updateSubscription.unsubscribe();
  }

  onUpdate(): void {
    const updateData = new UpdateCourse();
    updateData.name = this.courseEditFrm.controls['name'].value;
    updateData.description = this.courseEditFrm.controls['description'].value;

    this.updateSubscription = this.courseService
      .updateCourse(this.courseId, updateData)
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
