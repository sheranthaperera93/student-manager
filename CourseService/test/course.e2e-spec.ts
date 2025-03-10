import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { mockCourseService } from './mocks';
import { CourseModule } from 'src/course/course.module';
import { CourseService } from 'src/course/course.service';
import { Course } from 'src/course/entities/course.entity';

describe('CourseService (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CourseModule],
    })
      .overrideProvider(CourseService)
      .useValue(mockCourseService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should get all courses', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            courses {
              id
              name
              description
              userId
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        const transformedCourses = res.body.data.courses.map(
          (course: Course) => ({
            ...course,
            id: course.id.toString(),
          }),
        );
        expect(res.body.data.courses).toEqual(transformedCourses);
      });
  });

  it('should get a course by id', () => {
    return request(app.getHttpServer())
      .post('/graphql')
      .send({
        query: `
          query {
            course(id: 1) {
              id
              name
              description
              userId
            }
          }
        `,
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.data.course).toEqual({
          id: '1',
          name: '',
          description: '',
          userId: '1',
        });
      });
  });

  afterAll(async () => {
    await app.close();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });
});
