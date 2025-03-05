import { Test, TestingModule } from '@nestjs/testing';
import { CourseResolver } from './course.resolver';
import { CourseService } from './course.service';
import { Course } from '../entities/course.entity';

describe('CourseResolver', () => {
  let resolver: CourseResolver;
  let courseService: CourseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CourseResolver,
        {
          provide: CourseService,
          useValue: {
            findOne: jest
              .fn()
              .mockResolvedValue({ id: 1, name: 'Test Course' }),
            findAll: jest
              .fn()
              .mockResolvedValue([{ id: 1, name: 'Test Course' }]),
          },
        },
      ],
    }).compile();

    resolver = module.get<CourseResolver>(CourseResolver);
    courseService = module.get<CourseService>(CourseService);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return a course by id', async () => {
    const result = await resolver.course(1);
    expect(result).toEqual({ id: 1, name: 'Test Course' });
    expect(courseService.findOne).toHaveBeenCalledWith(1);
  });

  it('should return an array of courses', async () => {
    const result = await resolver.courses();
    expect(result).toEqual([{ id: 1, name: 'Test Course' }]);
    expect(courseService.findAll).toHaveBeenCalled();
  });

  it('should return a user for a course', () => {
    const course: Course = {
      id: 1,
      name: 'Mastering React Native',
      description: 'Mastering react native knowledge',
      userId: 1,
    };
    const result = resolver.user(course);
    expect(result).toEqual({ __typename: 'User', id: 1 });
  });
});
