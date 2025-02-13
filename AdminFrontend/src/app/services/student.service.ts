import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { State } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { UpdateStudent } from '../model/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  constructor(private readonly apollo: Apollo) {}

  getStudents = (state: State): Observable<GridDataResult> => {
    return this.apollo
      .watchQuery({
        query: gql`
          query getUsers($skip: Float, $take: Float) {
            getUsers(skip: $skip, take: $take) {
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
        },
        fetchPolicy: 'cache-and-network',
      })
      .valueChanges.pipe(
        map((result: any) => ({
          data: result.data.getUsers.items,
          total: result.data.getUsers.total,
        }))
      );
  };

  updateStudent = (id: number, data: UpdateStudent) => {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation updateUser($id: ID!, $data: UpdateUserInput!) {
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

  deleteStudent = (id: number) => {
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

  uploadFile = (file: File) => {
    return this.apollo.mutate({
      mutation: gql`
        mutation UploadFile($file: UploadFileInput!) {
          uploadFile(file: $file) {
            success
            message
          }
        }
      `,
      variables: { file },
    });
  };
}
