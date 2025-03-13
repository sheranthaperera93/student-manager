import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, In, Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { CustomException } from 'src/core/custom-exception';
import { PaginatedCourses } from './models/paginated-courses.model';
import { CourseInputDTO } from './models/course-input.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async findByIds(ids: number[]): Promise<Course[]> {
    return await this.courseRepository.find({ where: { id: In(ids) } });
  }

  async findById(id: number): Promise<Course> {
    return this.courseRepository.findOneByOrFail({ id });
  }

  async findAll({
    skip,
    take,
  }: {
    skip?: number;
    take?: number;
  }): Promise<PaginatedCourses> {
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
  }

  async update(
    id: number,
    updateUserInput: CourseInputDTO,
  ): Promise<string> {
    try {
      const user = await this.findById(id);
      Object.assign(user, updateUserInput);
      await this.courseRepository.update({ id: user.id }, user);
      return 'Course updated successfully';
    } catch (error) {
      Logger.error(error, 'Course Service - Update');
      if (error.name === EntityNotFoundError.name) {
        throw new CustomException(
          'Failed to update the course record: Course not found in the system.',
          1004,
          {},
          HttpStatus.NOT_FOUND,
        );
      }
      throw new CustomException(
        'Failed to update the course record: System encountered an unexpected issue.',
        1005,
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async delete(id: number): Promise<string> {
    try {
      await this.findById(id);
      await this.courseRepository.delete({ id });
      return 'Course deleted successfully';
    } catch (error) {
      if (error.message.includes('foreign key constraint')) {
        throw new CustomException(
          "Failed to delete courses. Make sure courses aren't assigned to users",
          1013,
          error,
          HttpStatus.CONFLICT,
        );
      }
      if (error.name === EntityNotFoundError.name) {
        throw new CustomException(
          'Failed to delete the course record: Course not found in the system.',
          1013,
          error,
          HttpStatus.NOT_FOUND,
        );
      }
      throw new CustomException(
        'Failed to delete the course record: System encountered an unexpected issue.',
        1013,
        error,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
