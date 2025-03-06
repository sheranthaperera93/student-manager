import { In, MigrationInterface, QueryRunner } from 'typeorm';
import { Course } from '../entities/course.entity'; // Adjust the import path as necessary

export class AddInitialCourses1740718900266 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const courses = [
      { name: 'Advanced NestJS', description: 'Deep dive into NestJS' },
      { name: 'Docker Essentials', description: 'Essential Docker concepts' },
      { name: 'Deep Learning', description: 'Deep Learning techniques' },
      {
        name: 'Cybersecurity Fundamentals',
        description: 'Basics of Cybersecurity',
      },
      {
        name: 'Cloud Computing',
        description: 'Introduction to Cloud Computing',
      },
      {
        name: 'Machine Learning',
        description: 'Introduction to Machine Learning',
      },
      { name: 'React Fundamentals', description: 'Learn the basics of React' },
      {
        name: 'Vue.js Essentials',
        description: 'Essential concepts of Vue.js',
      },
      { name: 'Angular Mastery', description: 'Master Angular framework' },
      {
        name: 'Python for Data Science',
        description: 'Data Science with Python',
      },
      { name: 'DevOps Practices', description: 'Best practices in DevOps' },
      { name: 'Kubernetes Basics', description: 'Basics of Kubernetes' },
      {
        name: 'Microservices Architecture',
        description: 'Designing Microservices',
      },
      {
        name: 'Blockchain Technology',
        description: 'Introduction to Blockchain',
      },
    ];

    await queryRunner.manager.save(Course, courses);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const courseNames = [
      'Advanced NestJS',
      'Docker Essentials',
      'Deep Learning',
      'Cybersecurity Fundamentals',
      'Cloud Computing',
      'Machine Learning',
      'React Fundamentals',
      'Vue.js Essentials',
      'Angular Mastery',
      'Python for Data Science',
      'DevOps Practices',
      'Kubernetes Basics',
      'Microservices Architecture',
      'Blockchain Technology',
    ];

    await queryRunner.manager.delete(Course, { name: In(courseNames) });
  }
}
