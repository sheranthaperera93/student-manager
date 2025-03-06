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
    console.log('User', user);
    const userCourses = await this.userCourseService.findByUserId(user.id);
    console.log('userCourses', userCourses);
    const courseIds = userCourses.map((uc: UserCourse) => uc.courseId);
    console.log('courseIds', courseIds);
    return await this.courseService.findByIds(courseIds);
  }

  @ResolveReference()
  resolveReference(ref: { id: number }): any {
    console.log('referencing in user resolver', ref);
    return { __typename: 'User', id: ref.id };
  }
}
