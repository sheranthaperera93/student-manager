import { TestBed } from '@angular/core/testing';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';

import { StudentService } from './student.service';
import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing';
import { State } from '@progress/kendo-data-query';
import { UpdateStudent } from '../model/student.model';
import { environment } from '../../environments/environment.testing';
import { provideHttpClient } from '@angular/common/http';

describe('StudentService', () => {
  let service: StudentService;
  let apolloController: ApolloTestingController;
  let httpController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(StudentService);
    apolloController = TestBed.inject(ApolloTestingController);
    httpController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    apolloController.verify();
    httpController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch students', () => {
    const state: State = { skip: 0, take: 10 };
    const mockResponse = {
      data: {
        getUsers: {
          items: [
            {
              id: 1,
              name: 'John Doe',
              email: 'john@example.com',
              date_of_birth: '2000-01-01',
            },
          ],
          total: 1,
        },
      },
    };

    service.getStudents(state).subscribe((result) => {
      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe('John Doe');
      expect(result.total).toBe(1);
    });

    const op = apolloController.expectOne((operation) => {
      return operation.operationName === 'getUsers';
    });
    op.flush(mockResponse);
  });

  it('should update a student', () => {
    const id = 1;
    const data: UpdateStudent = {
      name: 'John Doe',
      email: 'john@example.com',
      date_of_birth: new Date('2000-01-01'),
    };
    const mockResponse = {
      data: {
        updateUser: {
          message: 'Student updated successfully',
          data: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            date_of_birth: data.date_of_birth,
          },
        },
      },
    };

    service.updateStudent(id, data).subscribe((result) => {
      expect(result.message).toBe('Student updated successfully');
      expect(result.data.id).toBe(1);
    });

    const op = apolloController.expectOne('updateUser');
    op.flush(mockResponse);

    apolloController.verify();
  });

  it('should delete a student', () => {
    const id = 1;
    const mockResponse = {
      data: {
        deleteUser: {
          message: 'Student deleted successfully',
          data: { id: 1 },
        },
      },
    };

    service.deleteStudent(id).subscribe((result) => {
      expect(result.message).toBe('Student deleted successfully');
      expect(result.data.id).toBe(1);
    });

    const op = apolloController.expectOne((operation) => {
      return operation.operationName === 'deleteUser';
    });
    expect(op.operation.variables['id']).toBe(1);
    op.flush(mockResponse);

    apolloController.verify();
  });

  it('should fetch courses for a student', () => {
    const studentId = 1;
    const mockResponse = {
      data: {
        getUser: {
          courses: [
            {
              id: 1,
              name: 'Math',
              description: 'Mathematics course',
            },
          ],
        },
      },
    };

    service.getCoursesForStudentId(studentId).subscribe((result) => {
      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Math');
    });

    const op = apolloController.expectOne((operation) => {
      return operation.operationName === 'getUser';
    });
    op.flush(mockResponse);
  });

  it('should upload a file', () => {
    const file = new File(['content'], 'test.txt');
    const mockResponse = { message: 'File uploaded successfully' };

    service.uploadFile(file).subscribe((result) => {
      expect(result.message).toBe('File uploaded successfully');
    });

    const req = httpController.expectOne(
      environment.userService + '/users/upload'
    );
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);
  });

  it('should export data', () => {
    const params = { ageRange: { from: 20, to: 30 } };
    const mockResponse = {
      data: {
        exportUsers: {
          message: 'Data exported successfully',
          data: {},
        },
      },
    };

    service.exportData(params).subscribe((result) => {
      expect(result.message).toBe('Data exported successfully');
    });

    const op = apolloController.expectOne('exportUsers');
    op.flush(mockResponse);
  });
});
