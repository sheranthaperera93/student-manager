import {
  Parent,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { CourseService } from './course.service';
import { UserCourseService } from './user-course/user-course.service';
import { Course } from '../entities/course.entity';
import { UserCourse } from '../entities/user-course.entity';

@Resolver((of) => User)
export class UserResolver {
  constructor(
    private readonly courseService: CourseService,
    private readonly userCourseService: UserCourseService,
  ) {}

  @ResolveField((of) => [Course])
  async courses(@Parent() user: User): Promise<Course[]> {
    const userCourses = await this.userCourseService.findByUserId(user.id);
    const courseIds = userCourses.map((uc: UserCourse) => uc.courseId);
    return await this.courseService.findByIds(courseIds);
  }

  @ResolveReference()
  resolveReference(ref: { id: number }): any {
    return { __typename: 'User', id: ref.id };
  }
}
