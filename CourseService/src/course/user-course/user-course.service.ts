import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCourse } from '../entities/user-course.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserCourseService {
  constructor(
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
  ) {}

  async findByUserId(userId: number): Promise<UserCourse[]> {
    return await this.userCourseRepository.findBy({ userId });
  }

  async findByCourseId(courseId: number): Promise<UserCourse[]> {
    return await this.userCourseRepository.findBy({ courseId });
  }
}
