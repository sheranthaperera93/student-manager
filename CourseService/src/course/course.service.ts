import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';

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
    return await this.courseRepository.findOneByOrFail({ id });
  };

  findAll = async (): Promise<Course[]> => {
    return await this.courseRepository.find();
  };
}
