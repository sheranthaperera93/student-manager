import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CustomException } from 'src/core/custom-exception';
import { UserCourse } from './entities/user-course.entity';
import { PaginatedCourses } from './models/paginated-courses.model';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(UserCourse)
    private readonly userCourseRepository: Repository<UserCourse>,
  ) {}

  findByIds = async (ids: number[]): Promise<Course[]> => {
    return await this.courseRepository.find({ where: { id: In(ids) } });
  };

  findOne = async (id: number): Promise<Course> => {
    try {
      return await this.courseRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new CustomException(
        'Course not found in the system.',
        1004,
        {},
        HttpStatus.NOT_FOUND,
      );
    }
  };

  findAll = async ({
    skip,
    take,
  }: {
    skip?: number;
    take?: number;
  }): Promise<PaginatedCourses> => {
    const query = this.courseRepository.createQueryBuilder('course');
    if (skip !== undefined) {
      query.skip(skip);
    }
    if (take !== undefined) {
      query.take(take);
    }
    query.orderBy('course.id', 'ASC');
    const [items, total] = await query.getManyAndCount();
    return { items, total };
  };
}
