import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Apollo, gql } from 'apollo-angular';
import { State } from '@progress/kendo-data-query';
import { GridDataResult } from '@progress/kendo-angular-grid';
import { UpdateCourse } from '../model/course.model';
import { Response } from '../model/response.model';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(private readonly apollo: Apollo) {}

  getCourses = (state?: State): Observable<GridDataResult> => {
    return this.apollo
      .watchQuery({
        query: gql`
          query getCourses($skip: Float, $take: Float) {
            getCourses(skip: $skip, take: $take) {
              items {
                id
                name
                description
              }
              total
            }
          }
        `,
        variables: {
          skip: state?.skip,
          take: state?.take,
        },
        fetchPolicy: 'cache-and-network',
      })
      .valueChanges.pipe(
        map(
          (result: any) =>
            <GridDataResult>{
              data: result.data.getCourses.items,
              total: result.data.getCourses.total,
            }
        )
      );
  };

  updateCourse = (id: number, data: UpdateCourse): Observable<Response> => {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation updateCourse($id: ID!, $data: CourseInputDTO!) {
            updateCourse(id: $id, data: $data) {
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
          message: result.data.updateCourse.message,
          data: result.data.updateCourse.data,
        }))
      );
  };

  deleteCourse = (id: number): Observable<Response> => {
    return this.apollo
      .mutate({
        mutation: gql`
          mutation deleteCourse($id: ID!) {
            deleteCourse(id: $id) {
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
          message: result.data.deleteCourse.message,
          data: result.data.deleteCourse.data,
        }))
      );
  };
}
