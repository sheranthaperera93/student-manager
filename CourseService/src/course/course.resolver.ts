import {
  Args,
  ID,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  ResolveReference,
} from '@nestjs/graphql';
import { Course } from './entities/course.entity';
import { CourseService } from './course.service';
import { PaginatedCourses } from './models/paginated-courses.model';
import { CourseInputDTO } from './models/course-input.dto';
import { Response } from './models/response.model';
import { User } from './entities/user.entity';
import { UserCourse } from './entities/user-course.entity';
import { UserCourseService } from './user-course/user-course.service';
import { UserService } from './user.service';

@Resolver((of) => Course)
export class CourseResolver {
  constructor(
    private readonly courseService: CourseService,
    private readonly userService: UserService,
    private readonly userCourseService: UserCourseService
  ) {}

  @Query((returns) => Course)
  async getCourse(@Args({ name: 'id', type: () => Int }) id: number) {
    return await this.courseService.findById(id);
  }

  @Query((returns) => PaginatedCourses)
  async getCourses(
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
  ): Promise<PaginatedCourses> {
    return await this.courseService.findAll({ skip, take });
  }

  @ResolveField((of) => [User])
  async users(@Parent() course: Course): Promise<User[]> {
    console.log('Course', course);
    const userCourses = await this.userCourseService.findByUserId(course.id);
    console.log('userCourses', userCourses);
    const userId = userCourses.map((uc: UserCourse) => uc.userId);
    console.log('userId', userId);
    return await this.userService.findByIds(userId);
  }

  // @ResolveReference()
  // resolveReference(ref: { id: number }): any {
  //   console.log('referencing in user resolver', ref);
  //   return { __typename: 'User', id: ref.id };
  // }

  @Mutation((returns) => Response)
  async updateCourse(
    @Args({ name: 'id', type: () => ID }) id: number,
    @Args({ name: 'data', type: () => CourseInputDTO })
    updateCourseInput: CourseInputDTO,
  ): Promise<Response> {
    const resp = await this.courseService.update(id, updateCourseInput);
    let response: Response = {
      message: resp,
      data: { updated: true },
    };
    return response;
  }

  @Mutation((returns) => Response)
  async deleteCourse(
    @Args({ name: 'id', type: () => ID }) id: number,
  ): Promise<Response> {
    const resp = await this.courseService.delete(id);
    let response: Response = {
      message: resp,
      data: { deleted: true },
    };
    return response;
  }
}
