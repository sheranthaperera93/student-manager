import {
    Parent,
    ResolveField,
    Resolver,
    ResolveReference,
  } from '@nestjs/graphql';
  import { User } from '../entities/user.entity';
  import { UsersService } from '../services/users.service';
  import { UserCourseService } from '../services/user-course.service';
  import { Course } from '../entities/course.entity';
  import { UserCourse } from '../entities/user-course.entity';
  
  @Resolver((of) => Course)
  export class CourseResolver {
    constructor(
      private readonly usersService: UsersService,
      private readonly userCourseService: UserCourseService,
    ) {}
  
    @ResolveField((of) => [User])
    async users(@Parent() course: Course): Promise<User[]> {
      console.log("Course", course);
      const userCourses = await this.userCourseService.findByCourseId(course.id);
      console.log("userCourses", userCourses);
      const userIds = userCourses.map((uc: UserCourse) => uc.userId);
      console.log("userIds", userIds);
      return await this.usersService.findByIds(userIds);
    }
  
    @ResolveReference()
    resolveReference(ref: { id: number }): any {
      console.log("referencing in course resolver", ref)
      return { __typename: 'User', id: ref.id };
    }
  }
  