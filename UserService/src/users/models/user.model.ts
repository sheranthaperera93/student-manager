import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
@Directive('@key(fields: "id")')
export class User {
  @Field((type) => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  date_of_birth: Date;

  @Field()
  email: string;
}
