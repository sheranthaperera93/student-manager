import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { State } from '@progress/kendo-data-query';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { Student, UpdateStudent } from '../model/student.model';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ExportParameters } from '../core/constants';
import { Course } from '../model/course.model';
import { Response } from '../model/response.model';
import { StudentSearch } from '../model/student-search.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  public refreshStudentList: Subject<StudentSearch> =
    new Subject<StudentSearch>();

  constructor(
    private readonly apollo: Apollo,
    private readonly http: HttpClient
  ) {}

  getStudents = (
    state: State,
    searchParams: StudentSearch
  ): Observable<GridDataResult> => {
    return this.apollo
      .watchQuery({
        query: gql`
          query getUsers(
            $skip: Float
            $take: Float
            $name: String!
            $email: String!
            $dateOfBirth: DateOfBirthRangeInput!
          ) {
            getUsers(
              skip: $skip
              take: $take
              name: $name
              email: $email
              dateOfBirth: $dateOfBirth
            ) {
              items {
                id
                name
                email
                date_of_birth
              }
              total
            }
          }
        `,
        variables: {
          skip: state.skip,
          take: state.take,
          name: searchParams?.name,
          email: searchParams?.email,
          dateOfBirth: searchParams?.dob,
        },
        fetchPolicy: 'cache-and-network',
      })
      .valueChanges.pipe(
        map(
          (result: any) =>
            <GridDataResult>{
              data: result.data.getUsers.items,
              total: result.data.getUsers.total,
            }
        )
      );
  };

  getStudentById = (studentId: number): Observable<Student> => {
    return this.apollo
      .watchQuery({
        query: gql`
          query getUser($id: ID!) {
            getUser(id: $id) {
              id
              name
              email
              date_of_birth
              courses {
                id
                name
                description
              }
            }
          }
        `,
        variables: {
          id: studentId,
        },
        fetchPolicy: 'cache-and-network',
      })
      .valueChanges.pipe(map((result: any) => result.data.getUser));
  };

  getCoursesForStudentId = (studentId: number): Observable<Course[]> => {
    return this.apollo
      .watchQuery({
        query: gql`
          query getUser($id: ID!) {
            getUser(id: $id) {
              courses {
                id
                name
                description
              }
            }
          }
        `,
        variables: {
          id: studentId,
        },
        fetchPolicy: 'cache-and-network',
      })
      .valueChanges.pipe(map((result: any) => result.data.getUser.courses));
  };

  updateStudent = (id: number, data: UpdateStudent): Observable<Response> => {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation updateUser($id: ID!, $data: UserInputDTO!) {
            updateUser(id: $id, data: $data) {
              message
              data
            }
          }
        `,
        variables: {
          id,
          data,
        },
      })
      .pipe(
        map((result: any) => ({
          message: result.data.updateUser.message,
          data: result.data.updateUser.data,
        }))
      );
  };

  deleteStudent = (id: number): Observable<Response> => {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation deleteUser($id: ID!) {
            deleteUser(id: $id) {
              message
              data
            }
          }
        `,
        variables: {
          id,
        },
      })
      .pipe(
        map((result: any) => ({
          message: result.data.deleteUser.message,
          data: result.data.deleteUser.data,
        }))
      );
  };

  uploadFile = (files: File[]): Observable<any> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    }); // Ensure rawFile is used
    return this.http.post(environment.userService + '/users/upload', formData);
  };

  exportData = (params: ExportParameters): Observable<Response> => {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation exportUsers($age: String!) {
            exportUsers(age: $age) {
              message
              data
            }
          }
        `,
        variables: {
          age: `${params.ageRange.from}-${params.ageRange.to}`,
        },
      })
      .pipe(
        map((result: any) => ({
          message: result.data.exportUsers.message,
          data: {},
        }))
      );
  };
}
