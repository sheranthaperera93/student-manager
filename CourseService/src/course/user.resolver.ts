import { Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { User } from './entities/user.entity';
import { CourseService } from './course.service';
import { Course } from './entities/course.entity';

@Resolver((of) => User)
export class UserResolver {
  constructor(private readonly courseService: CourseService) {}

  @ResolveField((of) => [Course])
  async courses(@Parent() user: User): Promise<Course[]> {
    return await this.courseService.findAllByUserId(user.id);
  }
}
