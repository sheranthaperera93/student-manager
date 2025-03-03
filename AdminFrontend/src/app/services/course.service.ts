import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Apollo, gql } from 'apollo-angular';
import { State } from '@progress/kendo-data-query';
import { GridDataResult } from '@progress/kendo-angular-grid';

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
}
