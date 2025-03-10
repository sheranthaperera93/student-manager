
import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { UsersController } from './users.controller';
import { KafkaModule } from 'src/kafka/kafka.module';
import { HttpModule } from '@nestjs/axios';
import { UserCourseService } from './user-course/user-course.service';
import { Course } from 'src/users/entities/course.entity';
import { UserCourse } from 'src/users/entities/user-course.entity';

@Module({
  providers: [UsersResolver, UsersService, UserCourseService],
  imports: [
    TypeOrmModule.forFeature([User, UserCourse, Course]),
    
    KafkaModule,
    HttpModule
  ],
  controllers: [UsersController],
})
export class UsersModule {}
