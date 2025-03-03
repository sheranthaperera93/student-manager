import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { CourseService } from '../../services/course.service';
import { GridComponent, GridDataResult } from '@progress/kendo-angular-grid';
import { State } from '@progress/kendo-data-query';
import { debounceTime, Subscription } from 'rxjs';
import { PageChangeEvent } from '@progress/kendo-angular-pager';
import { Course } from '../../model/course.model';

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
  private readonly fetchStudentListSubscription: Subscription =
    new Subscription();

  gridData: GridDataResult = { data: [], total: 0 };
  @ViewChild('grid') private readonly grid!: GridComponent;

  constructor(private readonly courseService: CourseService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.fetchStudentListSubscription.unsubscribe();
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
    this.courseService.getCourses(this.pageState).subscribe({
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
}
