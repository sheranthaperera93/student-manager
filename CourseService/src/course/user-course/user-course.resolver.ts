import {
  Args,
  Int,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UserCourse } from '../entities/user-course.entity';
import { UserCourseService } from './user-course.service';
import { User } from '../entities/user.entity';
import { Course } from '../entities/course.entity';

@Resolver((of) => UserCourse)
export class UserCourseResolver {
  constructor(private readonly userCourseService: UserCourseService) {}

  @Mutation((returns) => [UserCourse])
  async updateUserCourses(
    @Args({ name: 'userId', type: () => Int }) userId: number,
    @Args({ name: 'courseIds', type: () => [Int] }) courseIds: number[],
  ) {
    return await this.userCourseService.updateUserCourses(userId, courseIds);
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
