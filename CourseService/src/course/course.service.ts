import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CustomException } from 'src/core/custom-exception';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  findAllByUserId = async (id: number): Promise<Course[]> => {
    return await this.courseRepository.findBy({ userId: id });
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

  findAll = async (): Promise<Course[]> => {
    return await this.courseRepository.find();
  };
}
