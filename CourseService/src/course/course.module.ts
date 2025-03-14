import { Module } from '@nestjs/common';
import { CourseService } from './services/course.service';

import { CourseResolver } from './resolvers/course.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { User } from './entities/user.entity';
import { UserResolver } from './resolvers/user.resolver';
import { UserCourseService } from './user-course/user-course.service';
import { UserCourse } from './entities/user-course.entity';
import { UserCourseResolver } from './user-course/user-course.resolver';
import { UserService } from './services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, UserCourse, User]),    
  ],
  providers: [
    CourseResolver,
    CourseService,
    UserResolver,
    UserCourseResolver,
    UserCourseService,
    UserService,
  ],
})
export class CourseModule {}
