import { Component, OnDestroy, OnInit } from '@angular/core';
import { Student, UpdateStudent } from '../model/student.model';
import { StudentService } from '../services/student.service';
import {
  caretAltDownIcon,
  caretAltUpIcon,
  pencilIcon,
  SVGIcon,
  trashIcon,
  arrowRotateCwIcon,
} from '@progress/kendo-svg-icons';
import { ExportParameters } from '../core/constants';
import { State } from '@progress/kendo-data-query';

import {
  BehaviorSubject,
  Observable,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { PageChangeEvent } from '@progress/kendo-angular-pager';
import { UtilService } from '../services/util.service';
import {
  DialogCloseResult,
  DialogRef,
  DialogResult,
  DialogService,
} from '@progress/kendo-angular-dialog';
import { StudentUpdateComponent } from '../student-update/student-update.component';
import { Response } from '../model/response.model';

@Component({
  selector: 'app-student-list',
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.scss',
  standalone: false,
})
export class StudentListComponent implements OnInit, OnDestroy {
  public editIcon: SVGIcon = pencilIcon;
  public deleteIcon: SVGIcon = trashIcon;
  public carrotDownIcon: SVGIcon = caretAltDownIcon;
  public carrotUpIcon: SVGIcon = caretAltUpIcon;
  public refreshIcon: SVGIcon = arrowRotateCwIcon;
  public showExportPopup: boolean = false;

  // Paging variables
  public loading: boolean = false;
  public pageState: State = {
    skip: 0,
    take: 10,
  };

  public gridData!: Observable<GridDataResult>;
  private readonly stateChange = new BehaviorSubject<State>(this.pageState);
  private reloadListSubscription: Subscription = new Subscription();
  students$!: Observable<GridDataResult>;
  private deleteSubscription: Subscription = new Subscription();
  private updateSubscription: Subscription = new Subscription();

  constructor(
    public readonly studentService: StudentService,
    private readonly utilService: UtilService,
    private readonly dialogService: DialogService
  ) {
    this.gridData = this.stateChange.pipe(
      tap((state) => {
        this.pageState = state;
        this.loading = true;
      }),
      switchMap((state) => this.studentService.getStudents(state)),
      tap(() => {
        this.loading = false;
      })
    );
  }

  ngOnInit(): void {
    this.stateChange.next(this.pageState);
    this.reloadListSubscription =
      this.studentService.refreshStudentList.subscribe(() => {
        this.refreshData();
      });
  }

  ngOnDestroy(): void {
    this.reloadListSubscription.unsubscribe();
    if (this.updateSubscription) this.updateSubscription.unsubscribe();
    if (this.deleteSubscription) this.deleteSubscription.unsubscribe();
  }

  public pageChange(state: PageChangeEvent): void {
    this.stateChange.next(state);
  }

  public refreshData = () => {
    this.stateChange.next(this.pageState);
  };

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
          .subscribe((response: Response) => {
            this.pageState.skip = 0;
            this.stateChange.next(this.pageState);
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
          .subscribe((response: Response) => {
            this.pageState.skip = 0;
            this.stateChange.next(this.pageState); // Trigger state change
          });
      }
    });
  };

  /**
   * Handles the export action for the student list.
   * Logs the export parameters and hides the export popup.
   *
   * @param parameters - The parameters used for exporting data.
   */
  onExportHandler = (parameters: ExportParameters): void => {
    console.log('Exporting data with params: ', parameters);
    this.showExportPopup = false;
  };
}
