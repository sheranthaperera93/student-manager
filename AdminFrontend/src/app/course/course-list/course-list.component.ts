import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { GridComponent, GridDataResult } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { debounceTime, Subscription } from 'rxjs';
import { PageChangeEvent } from '@progress/kendo-angular-pager';
import { Course } from '../../model/course.model';
import { inboxIcon, pencilIcon, SVGIcon, trashIcon } from '@progress/kendo-svg-icons';
import {
  DialogCloseResult,
  DialogRef,
  DialogResult,
  DialogService,
} from '@progress/kendo-angular-dialog';
import { CourseUpdateComponent } from '../course-update/course-update.component';
import { NotificationService } from '../../services/notification.service';
import { CourseStudentsComponent } from '../course-students/course-students.component';

@Component({
  selector: 'app-course-list',
  standalone: false,
  templateUrl: './course-list.component.html',
  styleUrl: './course-list.component.scss',
})
export class CourseListComponent implements OnInit, AfterViewInit {
  // Paging variables
  public loading: boolean = false;
  public pageState: State = {
    skip: 0,
    take: 10,
  };
  public editIcon: SVGIcon = pencilIcon;
  public deleteIcon: SVGIcon = trashIcon;
  public viewCoursesIcon: SVGIcon = inboxIcon;
  private fetchCoursesSubscription: Subscription = new Subscription();
  private deleteSubscription: Subscription = new Subscription();

  gridData: GridDataResult = { data: [], total: 0 };
  @ViewChild('grid') private readonly grid!: GridComponent;

  constructor(
    private readonly courseService: CourseService,
    private readonly dialogService: DialogService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    if (this.fetchCoursesSubscription)
      this.fetchCoursesSubscription.unsubscribe();
    if (this.deleteSubscription) this.deleteSubscription.unsubscribe();
  }

  public ngAfterViewInit(): void {
    this.grid.pageChange
      .pipe(debounceTime(500))
      .subscribe((e) => this.pageChange(e));
  }

  pageChange(event: PageChangeEvent): void {
    this.pageState.skip = event.skip;
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.fetchCoursesSubscription = this.courseService
      .getCourses(this.pageState)
      .subscribe({
        next: (res: { data: Course[]; total: number }) => {
          this.gridData = {
            data: res.data,
            total: res.total,
          };
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        },
      });
  }

  public refreshData = () => {
    this.pageState = { skip: 0, take: 10 };
    this.loadData();
  };

  onEditStudentHandler = async (course: Course) => {
    const dialogRef: DialogRef = this.dialogService.open({
      title: 'Update Student',
      content: CourseUpdateComponent,
      actions: [],
      width: '25%',
    });

    const componentInstance = dialogRef.content
      .instance as CourseUpdateComponent;
    componentInstance.populateCourseDetails(course);

    dialogRef.result.subscribe((result: DialogResult) => {
      if (!(result instanceof DialogCloseResult)) {
        this.refreshData();
      }
    });
  };

  onViewStudentsHandler = async (course: Course) => {
    const dialogRef: DialogRef = this.dialogService.open({
      title: 'Coursers follow ' + course.name,
      content: CourseStudentsComponent,
      actions: [{ text: 'Close', themeColor: 'primary' }],
      width: 600,
      height: 400,
      minWidth: 250,
    });

    const component = dialogRef.content.instance as CourseStudentsComponent;
    component.fetchStudentList(course.id);
  };

  onDeleteStudentHandler = async (course: Course) => {
    const dialogRef: DialogRef = this.dialogService.open({
      title: 'Delete Course',
      content: 'Are you sure you want to delete this course?',
      actions: [{ text: 'No' }, { text: 'Yes', themeColor: 'primary' }],
      width: 450,
      height: 200,
      minWidth: 250,
    });

    dialogRef.result.subscribe((result: DialogResult) => {
      if (!(result instanceof DialogCloseResult) && result.text == 'Yes') {
        this.deleteSubscription = this.courseService
          .deleteCourse(course.id)
          .subscribe({
            next: () => {
              this.notificationService.showNotification(
                'success',
                'Course deleted successfully'
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
}
