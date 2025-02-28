import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { StudentService } from '../../services/student.service';
import { Course } from '../../model/course.model';

import { StudentCoursesComponent } from './student-courses.component';
import { GridModule } from '@progress/kendo-angular-grid';

describe('StudentCoursesComponent', () => {
  let component: StudentCoursesComponent;
  let fixture: ComponentFixture<StudentCoursesComponent>;
  let studentService: jasmine.SpyObj<StudentService>;

  beforeEach(async () => {
    studentService = jasmine.createSpyObj('StudentService', [
      'getCoursesForStudentId',
    ]);

    await TestBed.configureTestingModule({
      imports: [
        GridModule,
      ],
      declarations: [StudentCoursesComponent],
      providers: [{ provide: StudentService, useValue: studentService }],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentCoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch course list successfully', fakeAsync(() => {
    const mockCourses: Course[] = [
      { id: 1, name: 'Course 1', description: '' },
      { id: 2, name: 'Course 2', description: '' },
    ];
    studentService.getCoursesForStudentId.and.returnValue(of(mockCourses));

    component.fetchCourseList(1);
    tick();

    expect(studentService.getCoursesForStudentId).toHaveBeenCalledWith(1);
    expect(component.gridData).toEqual(mockCourses);
    expect(component.loading).toBeFalse();
  }));

  it('should handle error when fetching course list', fakeAsync(() => {
    const errorResponse = new Error('Error fetching course list');
    studentService.getCoursesForStudentId.and.returnValue(
      throwError(() => errorResponse)
    );

    component.fetchCourseList(1);
    tick();

    expect(studentService.getCoursesForStudentId).toHaveBeenCalledWith(1);
    expect(component.gridData).toEqual([]);
    expect(component.loading).toBeFalse();
  }));
});
