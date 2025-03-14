import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserCourse } from '../entities/user-course.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UserCourseService {
  constructor(
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
    private readonly dataSource: DataSource,
  ) {}

  findByUserId = async (userId: number): Promise<UserCourse[]> => {
    return await this.userCourseRepository.findBy({ userId });
  };

  findByCourseId = async (courseId: number): Promise<UserCourse[]> => {
    return await this.userCourseRepository.findBy({ courseId });
  };

  updateUserCourses = async (
    userId: number,
    userCourses: number[],
  ): Promise<UserCourse[]> => {
    const userCoursesData = userCourses.map((uc: number) => ({
      userId,
      courseId: uc,
    }));
    return await this.dataSource.transaction(async (manager) => {
      await manager.delete(UserCourse, { userId });
      return await manager.save(UserCourse, userCoursesData);
    })
  };
}
