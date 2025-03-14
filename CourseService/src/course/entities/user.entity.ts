import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Course } from './course.entity';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class User {
  @Field((type) => ID)
  @Directive('@external')
  id: number;

  @Field((type) => [Course])
  courses?: Course[];
}
