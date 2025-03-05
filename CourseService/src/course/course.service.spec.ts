import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CourseService } from './course.service';
import { Course } from '../entities/course.entity';
import { CustomException } from 'src/core/custom-exception';

describe('CourseService', () => {
  let service: CourseService;
  let courseRepository: Repository<Course>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseService,
        {
          provide: getRepositoryToken(Course),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<CourseService>(CourseService);
    courseRepository = module.get<Repository<Course>>(
      getRepositoryToken(Course),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllByUserId', () => {
    it('should return an array of courses', async () => {
      const userId = 1;
      const courses = [
        {
          id: 1,
          name: 'Mastering React Native',
          description: 'Mastering react native knowledge',
          userId,
        },
        {
          id: 2,
          name: 'NodeJS Expertise',
          description: 'Mastering NodeJS in industry level',
          userId,
        },
      ];
      jest.spyOn(courseRepository, 'findBy').mockResolvedValue(courses);

      expect(await service.findAllByUserId(userId)).toEqual(courses);
    });
  });

  describe('findOne', () => {
    it('should return a course', async () => {
      const course = {
        id: 1,
        name: 'Mastering React Native',
        description: 'Mastering react native knowledge',
        userId: 1,
      };
      jest.spyOn(courseRepository, 'findOneByOrFail').mockResolvedValue(course);

      expect(await service.findOne(1)).toEqual(course);
    });

    it('should throw a CustomException if course not found', async () => {
      jest
        .spyOn(courseRepository, 'findOneByOrFail')
        .mockRejectedValue(new Error());

      await expect(service.findOne(1)).rejects.toThrow(CustomException);
    });
  });

  describe('findAll', () => {
    it('should return an array of courses', async () => {
      const courses = [
        {
          id: 1,
          name: 'Mastering React Native',
          description: 'Mastering react native knowledge',
          userId: 1,
        },
        {
          id: 2,
          name: 'NodeJS Expertise',
          description: 'Mastering NodeJS in industry level',
          userId: 1,
        },
      ];
      jest.spyOn(courseRepository, 'find').mockResolvedValue(courses);

      expect(await service.findAll()).toEqual(courses);
    });
  });
});
