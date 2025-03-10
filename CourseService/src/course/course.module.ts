import { Module } from '@nestjs/common';
import { CourseService } from './course.service';
import { CourseResolver } from './course.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from '../course/entities/course.entity';
import { User } from '../course/entities/user.entity';
import { UserCourseService } from './user-course/user-course.service';
import { UserCourse } from '../course/entities/user-course.entity';
import { UserCourseResolver } from './user-course/user-course.resolver';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, UserCourse, User]),    
  ],
  providers: [
    CourseResolver,
    CourseService,
    UserCourseResolver,
    UserCourseService,
    UserService,
  ],
})
export class CourseModule {}
