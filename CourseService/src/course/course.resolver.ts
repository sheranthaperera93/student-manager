import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Course } from '../entities/course.entity';
import { CourseService } from './course.service';
import { PaginatedCourses } from './models/paginated-courses.model';
import { CourseInputDTO } from './models/course-input.dto';
import { Response } from './models/response.model';

@Resolver((of) => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query((returns) => Course)
  async getCourseById(@Args({ name: 'id', type: () => Int }) id: number) {
    return await this.courseService.findById(id);
  }

  @Query((returns) => PaginatedCourses)
  async getCourses(
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
  ): Promise<PaginatedCourses> {
    return await this.courseService.findAll({ skip, take });
  }

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
