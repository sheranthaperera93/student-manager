import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCourse } from 'src/entities/user-course.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserCourseService {
  constructor(
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
  ) {}

  findByUserId = async (userId: number): Promise<UserCourse[]> => {
    return await this.userCourseRepository.findBy({ userId });
  };

  findByCourseId = async (courseId: number): Promise<UserCourse[]> => {
    return await this.userCourseRepository.findBy({ courseId });
  };
}
