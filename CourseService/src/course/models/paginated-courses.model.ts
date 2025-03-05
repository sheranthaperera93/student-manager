import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Course } from '../../entities/course.entity';

@ObjectType()
export class PaginatedCourses {
  @Field(() => [Course])
  items: Course[];

  @Field(() => Int)
  total: number;
}
