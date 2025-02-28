import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Student, UpdateStudent } from '../../model/student.model';
import { StudentService } from '../../services/student.service';
import {
  pencilIcon,
  SVGIcon,
  trashIcon,
  eyeIcon,
} from '@progress/kendo-svg-icons';
import { State } from '@progress/kendo-data-query';

import { debounceTime, Observable, Subscription } from 'rxjs';
import { GridComponent, GridDataResult } from '@progress/kendo-angular-grid';
import { PageChangeEvent } from '@progress/kendo-angular-pager';
import { UtilService } from '../../services/util.service';
import {
  DialogCloseResult,
  DialogRef,
  DialogResult,
  DialogService,
} from '@progress/kendo-angular-dialog';
import { StudentUpdateComponent } from '../student-update/student-update.component';
import { NotificationService } from '../../services/notification.service';
import { StudentCoursesComponent } from '../student-courses/student-courses.component';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
  standalone: false,
})
export class StudentListComponent implements OnInit, OnDestroy {
  public editIcon: SVGIcon = pencilIcon;
  public deleteIcon: SVGIcon = trashIcon;
  public viewIcon: SVGIcon = eyeIcon;

  public showExportPopup: boolean = false;
  public isUploadDialogVisible = false;

  // Paging variables
  public loading: boolean = false;
  public pageState: State = {
    skip: 0,
    take: 10,
  };

  gridData: GridDataResult = { data: [], total: 0 };
  @ViewChild('grid') private readonly grid!: GridComponent;

  private reloadListSubscription: Subscription = new Subscription();
  students$!: Observable<GridDataResult>;
  private deleteSubscription: Subscription = new Subscription();
  private updateSubscription: Subscription = new Subscription();

  constructor(
    public readonly studentService: StudentService,
    private readonly utilService: UtilService,
    private readonly dialogService: DialogService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.reloadListSubscription =
      this.studentService.refreshStudentList.subscribe(() => {
        this.refreshData();
      });
    this.loadData();
  }

  public ngAfterViewInit(): void {
    this.grid.pageChange
      .pipe(debounceTime(500))
      .subscribe((e) => this.pageChange(e));
  }

  ngOnDestroy(): void {
    this.reloadListSubscription.unsubscribe();
    if (this.updateSubscription) this.updateSubscription.unsubscribe();
    if (this.deleteSubscription) this.deleteSubscription.unsubscribe();
  }

  pageChange(event: PageChangeEvent): void {
    this.pageState.skip = event.skip;
    this.loadData();
  }

  public refreshData = () => {
    this.pageState = { skip: 0, take: 10 };
    this.loadData();
  };

  loadData() {
    this.studentService
      .getStudents(this.pageState)
      .subscribe((res: { data: Student[]; total: number }) => {
        this.gridData = {
          data: res.data,
          total: res.total,
        };
      });
  }

  /**
   * Formats the date of birth to 'YYYY-MM-DD'.
   *
   * @param dateOfBirth - The date of birth to format.
   * @returns The formatted date of birth.
   */
  formatDate(dateOfBirth: Date): string {
    return this.utilService.formatDate(dateOfBirth, 'YYYY-MM-DD');
  }

  /**
   * Calculates the age based on the given date of birth.
   *
   * @param dateOfBirth - The date of birth to calculate the age from.
   * @returns The calculated age in years.
   */
  calculateAge(dateOfBirth: Date): number {
    return this.utilService.calculateAge(dateOfBirth);
  }

  /**
   * Handles the edit action for a student.
   *
   * @param student - The student object to be edited.
   * @returns void
   */
  onEditStudentHandler = (student: Student): void => {
    const dialogRef: DialogRef = this.dialogService.open({
      title: 'Update Student',
      content: StudentUpdateComponent,
      actions: [],
    });

    // Get update component instance
    const userInfo = dialogRef.content.instance as StudentUpdateComponent;
    userInfo.editForm.patchValue({
      name: student.name,
      email: student.email,
      dateOfBirth: new Date(student.date_of_birth), // Convert to Date object
    });

    dialogRef.result.subscribe((result: DialogResult) => {
      if (!(result instanceof DialogCloseResult)) {
        const updateData = new UpdateStudent();
        updateData.name = userInfo.editForm.controls['name'].value;
        updateData.date_of_birth =
          userInfo.editForm.controls['dateOfBirth'].value;
        updateData.email = userInfo.editForm.controls['email'].value;

        this.updateSubscription = this.studentService
          .updateStudent(student.id, updateData)
          .subscribe({
            next: () => {
              this.notificationService.showNotification(
                'success',
                'Student updated successfully'
              );
              this.refreshData();
            },
            error: (error) => {
              this.notificationService.showNotification(
                'error',
                error.message,
                { hideAfter: 4000 }
              );
            },
          });
      }
    });
  };

  /**
   * Handles the deletion of a student record.
   *
   * This method sets the student record to be deleted and makes the delete confirmation dialog visible.
   *
   * @param student - The student record to be deleted.
   * @returns void
   */
  onDeleteStudentHandler = (student: Student): void => {
    const dialogRef: DialogRef = this.dialogService.open({
      title: 'Delete Student',
      content: 'Are you sure you want to delete this student?',
      actions: [{ text: 'No' }, { text: 'Yes', themeColor: 'primary' }],
      width: 450,
      height: 200,
      minWidth: 250,
    });

    dialogRef.result.subscribe((result: DialogResult) => {
      if (!(result instanceof DialogCloseResult) && result.text == 'Yes') {
        this.deleteSubscription = this.studentService
          .deleteStudent(student.id)
          .subscribe({
            next: () => {
              this.notificationService.showNotification(
                'success',
                'Student deleted successfully'
              );
              this.refreshData();
            },
            error: (error) => {
              this.notificationService.showNotification(
                'error',
                error.message,
                { hideAfter: 4000 }
              );
            },
          });
      }
    });
  };

  onViewCoursersHandler = (student: Student) => {
    //This method opens a dialog box which contains the coursers followed by the student
    const dialogRef: DialogRef = this.dialogService.open({
      title: 'Coursers followed by ' + student.name,
      content: StudentCoursesComponent,
      actions: [{ text: 'Close', themeColor: 'primary' }],
      width: 600,
      height: 400,
      minWidth: 250,
    });

    const component = dialogRef.content.instance as StudentCoursesComponent;
    component.fetchCourseList(student.id);
  };
}
