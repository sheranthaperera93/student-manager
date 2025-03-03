import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { Course } from './entities/course.entity';
import { CourseService } from './course.service';
import { PaginatedCourses } from './models/paginated-courses.model';

@Resolver((of) => Course)
export class CourseResolver {
  constructor(private readonly courseService: CourseService) {}

  @Query((returns) => Course)
  async getCourseById(@Args({ name: 'id', type: () => Int }) id: number) {
    return await this.courseService.findOne(id);
  }

  @Query((returns) => PaginatedCourses)
  async getCourses(
    @Args('skip', { type: () => Number, nullable: true }) skip?: number,
    @Args('take', { type: () => Number, nullable: true }) take?: number,
  ): Promise<PaginatedCourses> {
    return await this.courseService.findAll({skip, take});
  }
}
