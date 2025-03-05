import { Course } from "./course.model";

export class Student {
  id: number = 0;
  name: string = '';
  date_of_birth: Date = new Date();
  email: string = '';
  age?: number = 0;
  courses: Course[] = [];
}

export class UpdateStudent {
  name: string = '';
  date_of_birth: Date = new Date();
  email: string = '';
  courses: number[] = []
}
