import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentListComponent } from './student-list.component';
import { ApolloTestingModule } from 'apollo-angular/testing';
import { GridModule } from '@progress/kendo-angular-grid';
import { SVGIconModule } from '@progress/kendo-angular-icons';
import { ButtonModule } from '@progress/kendo-angular-buttons';
import { of, Subject, throwError } from 'rxjs';
import { DialogService } from '@progress/kendo-angular-dialog';
import { NotificationService } from '../services/notification.service';
import { StudentService } from '../services/student.service';
import { UtilService } from '../services/util.service';

describe('StudentListComponent', () => {
  let component: StudentListComponent;
  let fixture: ComponentFixture<StudentListComponent>;
  let studentService: jasmine.SpyObj<StudentService>;
  let utilService: jasmine.SpyObj<UtilService>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    studentService = jasmine.createSpyObj<StudentService>(
      'StudentService',
      ['getStudents', 'updateStudent', 'deleteStudent', 'exportData'],
      { refreshStudentList: new Subject<void>() } // Define refreshStudentList as a getter
    );
    utilService = jasmine.createSpyObj('UtilService', [
      'formatDate',
      'calculateAge',
    ]);
    dialogService = jasmine.createSpyObj('DialogService', ['open']);
    notificationService = jasmine.createSpyObj('NotificationService', [
      'showNotification',
    ]);

    await TestBed.configureTestingModule({
      imports: [ApolloTestingModule, GridModule, SVGIconModule, ButtonModule],
      declarations: [StudentListComponent],
      providers: [
        { provide: StudentService, useValue: studentService },
        { provide: UtilService, useValue: utilService },
        { provide: DialogService, useValue: dialogService },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(StudentListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    const mockData = { data: [], total: 0 };
    studentService.getStudents.and.returnValue(of(mockData));
    component.ngOnInit();
    expect(studentService.getStudents).toHaveBeenCalled();
  });

  it('should format date correctly', () => {
    const date = new Date();
    utilService.formatDate.and.returnValue('2023-01-01');
    expect(component.formatDate(date)).toBe('2023-01-01');
  });

  it('should calculate age correctly', () => {
    const date = new Date();
    utilService.calculateAge.and.returnValue(25);
    expect(component.calculateAge(date)).toBe(25);
  });

  it('should handle edit student', () => {
    const student = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      date_of_birth: '2000-01-01',
    };
    const dialogRef = {
      content: {
        instance: {
          editForm: {
            patchValue: jasmine.createSpy(),
            controls: {
              name: { value: 'John' },
              email: { value: 'john@example.com' },
              dateOfBirth: { value: '2000-01-01' },
            },
          },
        },
      },
      result: of({}),
    };
    dialogService.open.and.returnValue(dialogRef as any);
    studentService.updateStudent.and.returnValue(of({ message: '', data: {} }));
    component.onEditStudentHandler(student as any);
    expect(dialogService.open).toHaveBeenCalled();
    expect(studentService.updateStudent).toHaveBeenCalled();
  });

  it('should handle delete student', () => {
    const student = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      date_of_birth: '2000-01-01',
    };
    const dialogRef = { result: of({ text: 'Yes' }) };
    dialogService.open.and.returnValue(dialogRef as any);
    studentService.deleteStudent.and.returnValue(of({ message: '', data: {} }));
    component.onDeleteStudentHandler(student as any);
    expect(dialogService.open).toHaveBeenCalled();
    expect(studentService.deleteStudent).toHaveBeenCalled();
  });

  it('should handle export', () => {
    const parameters = {};
    studentService.exportData.and.returnValue(of({ message: '', data: {} }));
    component.onExportHandler(parameters as any);
    expect(studentService.exportData).toHaveBeenCalled();
    expect(component.showExportPopup).toBeFalse();
  });

  it('should handle view courses', () => {
    const student = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      date_of_birth: '2000-01-01',
    };
    const dialogRef = {
      content: { instance: { fetchCourseList: jasmine.createSpy() } },
    };
    dialogService.open.and.returnValue(dialogRef as any);
    component.onViewCoursersHandler(student as any);
    expect(dialogService.open).toHaveBeenCalled();
    expect(dialogRef.content.instance.fetchCourseList).toHaveBeenCalledWith(
      student.id
    );
  });

  it('should handle page change', () => {
    const event = { skip: 10 };
    component.pageChange(event as any);
    expect(component.pageState.skip).toBe(10);
    expect(studentService.getStudents).toHaveBeenCalled();
  });

  it('should refresh data', () => {
    component.refreshData();
    expect(component.pageState.skip).toBe(0);
    expect(studentService.getStudents).toHaveBeenCalled();
  });

  it('should handle errors on update student', () => {
    const student = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      date_of_birth: '2000-01-01',
    };
    const dialogRef = {
      content: {
        instance: {
          editForm: {
            patchValue: jasmine.createSpy(),
            controls: {
              name: { value: 'John' },
              email: { value: 'john@example.com' },
              dateOfBirth: { value: '2000-01-01' },
            },
          },
        },
      },
      result: of({}),
    };
    dialogService.open.and.returnValue(dialogRef as any);
    studentService.updateStudent.and.returnValue(
      throwError(() => new Error('Error'))
    );
    component.onEditStudentHandler(student as any);
    expect(dialogService.open).toHaveBeenCalled();
    expect(studentService.updateStudent).toHaveBeenCalled();
    expect(notificationService.showNotification).toHaveBeenCalledWith(
      'error',
      'Error',
      { hideAfter: 4000 }
    );
  });

  it('should handle errors on delete student', () => {
    const student = {
      id: 1,
      name: 'John',
      email: 'john@example.com',
      date_of_birth: '2000-01-01',
    };
    const dialogRef = { result: of({ text: 'Yes' }) };
    dialogService.open.and.returnValue(dialogRef as any);
    studentService.deleteStudent.and.returnValue(
      throwError(() => new Error('Error'))
    );
    component.onDeleteStudentHandler(student as any);
    expect(dialogService.open).toHaveBeenCalled();
    expect(studentService.deleteStudent).toHaveBeenCalled();
    expect(notificationService.showNotification).toHaveBeenCalledWith(
      'error',
      'Error',
      { hideAfter: 4000 }
    );
  });
});
