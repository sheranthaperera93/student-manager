import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Course } from '../model/course.model';
import { Apollo, gql } from 'apollo-angular';

@Injectable({
  providedIn: 'root',
})
export class CourseService {
  constructor(private readonly apollo: Apollo) {}

  getCourses = (): Observable<Course[]> => {
    return this.apollo
      .watchQuery({
        query: gql`
          query {
            courses {
              id
              name
              description
            }
          }
        `,
        fetchPolicy: 'cache-and-network',
      })
      .valueChanges.pipe(map((result: any) => result.data.courses));
  };
}
