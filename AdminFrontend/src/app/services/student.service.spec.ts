import { TestBed } from '@angular/core/testing';

import { StudentService } from './student.service';
import {
  ApolloTestingController,
  ApolloTestingModule,
} from 'apollo-angular/testing';
import { State } from '@progress/kendo-data-query';
import { UpdateStudent } from '../model/student.model';

xdescribe('StudentService', () => {
  let service: StudentService;
  let controller: ApolloTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
    });
    service = TestBed.inject(StudentService);
    controller = TestBed.inject(ApolloTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getStudents', () => {
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

      const op = controller.expectOne((operation) => {
        return operation.operationName === 'getUsers';
      });
      op.flush(mockResponse);
    });
  });

  describe('updateStudent', () => {
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

      const op = controller.expectOne('updateUser');
      op.flush(mockResponse);
    });
  });

  describe('deleteStudent', () => {
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

      const op = controller.expectOne('deleteUser');
      op.flush(mockResponse);
    });
  });

});
