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
import { UserCourseService } from './user-course/user-course.service';
import { UserCourse } from './entities/user-course.entity';

@Resolver((of) => Course)
export class CourseResolver {
  constructor(
    private readonly courseService: CourseService,
    private readonly userCourseService: UserCourseService,
  ) {}

  @Query((returns) => Course)
  async course(@Args({ name: 'id', type: () => Int }) id: number) {
    return await this.courseService.findOne(id);
  }

  @Query((returns) => [Course])
  async courses(): Promise<Course[]> {
    return await this.courseService.findAll();
  }

  @ResolveField((of) => [User])
  async user(@Parent() course: Course) {
    const userCourses = await this.userCourseService.findByCourseId(course.id);
    return userCourses.map((uc: UserCourse) => ({
      __typename: 'User',
      id: uc.userId,
    }));
  }
}
