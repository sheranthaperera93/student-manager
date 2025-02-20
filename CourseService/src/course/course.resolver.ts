import {
  Args,
  Int,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { Course } from './entities/course.entity';
import { User } from './entities/user.entity';
import { CourseService } from './course.service';

@Resolver((of) => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query((returns) => Course)
  async course(@Args({ name: 'id', type: () => Int }) id: number) {
    return await this.courseService.findOne(id);
  }

  @Query((returns) => [Course])
  async courses(): Promise<Course[]> {
    return await this.courseService.findAll();
  }

  @ResolveField((of) => User)
  user(@Parent() course: Course) {
    return { __typename: 'User', id: course.userId };
  }
}
