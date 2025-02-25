import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { CourseService } from './course.service';
import { User } from './entities/user.entity';
import { Course } from './entities/course.entity';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let courseService: CourseService;

  beforeEach(async () => {
    courseService = { findAllByUserId: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: CourseService, useValue: courseService },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('should return courses for a user', async () => {
    const user: User = { id: 1 } as User;
    const courses: Course[] = [{
      id: 1,
      name: 'Mastering React Native',
      description: 'Mastering react native knowledge',
      userId: 1,
    },] as Course[];
    jest.spyOn(courseService, 'findAllByUserId').mockResolvedValue(courses);

    expect(await resolver.courses(user)).toBe(courses);
    expect(courseService.findAllByUserId).toHaveBeenCalledWith(user.id);
  });
});
