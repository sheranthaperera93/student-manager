import { Test, TestingModule } from '@nestjs/testing';
import { CourseResolver } from './course.resolver';
import { CourseService } from './course.service';

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
    const result = await resolver.getCourse(1);
    expect(result).toEqual({ id: 1, name: 'Test Course' });
    expect(courseService.findById).toHaveBeenCalledWith(1);
  });

  it('should return an array of courses', async () => {
    const result = await resolver.getCourses();
    expect(result).toEqual([{ id: 1, name: 'Test Course' }]);
    expect(courseService.findAll).toHaveBeenCalled();
  });

});
