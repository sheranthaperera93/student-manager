import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Student } from '../../model/student.model';
import { StudentService } from '../../services/student.service';
import {
  pencilIcon,
  SVGIcon,
  trashIcon,
  inboxIcon,
} from '@progress/kendo-svg-icons';
import { State } from '@progress/kendo-data-query';

import { debounceTime, Subscription } from 'rxjs';
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
import { StudentSearch } from '../../model/student-search.model';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
  standalone: false,
})
export class StudentListComponent implements OnInit, OnDestroy {
  public editIcon: SVGIcon = pencilIcon;
  public deleteIcon: SVGIcon = trashIcon;
  public viewCoursesIcon: SVGIcon = inboxIcon;

  public showExportPopup: boolean = false;
  public isUploadDialogVisible = false;

  // Paging variables
  public loading: boolean = false;
  public pageState: State = {
    skip: 0,
    take: 10,
  };
  public searchParams: StudentSearch = new StudentSearch();

  gridData: GridDataResult = { data: [], total: 0 };
  @ViewChild('grid') private readonly grid!: GridComponent;

  private fetchListSubscription: Subscription = new Subscription();
  private reloadListSubscription: Subscription = new Subscription();
  private deleteSubscription: Subscription = new Subscription();

  constructor(
    public readonly studentService: StudentService,
    private readonly utilService: UtilService,
    private readonly dialogService: DialogService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.reloadListSubscription =
      this.studentService.refreshStudentList.subscribe(
        (payload: StudentSearch) => {
          this.searchParams = payload;
          this.refreshData();
        }
      );
    this.loadData();
  }

  public ngAfterViewInit(): void {
    this.grid.pageChange
      .pipe(debounceTime(500))
      .subscribe((e) => this.pageChange(e));
  }

  ngOnDestroy(): void {
    this.reloadListSubscription.unsubscribe();
    this.fetchListSubscription.unsubscribe();
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
    this.fetchListSubscription = this.studentService
      .getStudents(this.pageState, this.searchParams)
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
      width: '25%',
    });

    // Call populate data inside the component instance
    const componentInstance = dialogRef.content
      .instance as StudentUpdateComponent;
    componentInstance.populateData(student.id);

    dialogRef.result.subscribe((result: DialogResult) => {
      if (!(result instanceof DialogCloseResult)) {
        this.refreshData();
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
