import { Module } from '@nestjs/common';
import { UsersResolver } from './resolvers/users.resolver';
import { UsersService } from './services/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersController } from './controllers/users.controller';
import { KafkaModule } from 'src/kafka/kafka.module';
import { HttpModule } from '@nestjs/axios';
import { UserCourseService } from './services/user-course.service';
import { Course } from 'src/users/entities/course.entity';
import { UserCourse } from 'src/users/entities/user-course.entity';
import { CourseResolver } from './resolvers/course.resolver';

@Module({
  providers: [UsersResolver, UsersService, UserCourseService, CourseResolver],
  imports: [
    TypeOrmModule.forFeature([User, UserCourse, Course]),
    KafkaModule,
    HttpModule
  ],
  controllers: [UsersController],
})
export class UsersModule {}
