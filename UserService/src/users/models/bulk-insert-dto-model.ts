import { Field, ID, InputType } from '@nestjs/graphql';

@InputType()
export class BulkInsertDTO {
  @Field(() => ID)
  id: number;

  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  date_of_birth: Date;
}
