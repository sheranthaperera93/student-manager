import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

@ObjectType()
@Directive('@extends')
@Directive('@key(fields: "id")')
export class Course {
  @Field((type) => ID)
  @Directive('@external')
  id: number;

  @Field((type) => [User])
  users?: User[];
}
