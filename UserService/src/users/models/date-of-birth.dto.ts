import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class DateOfBirthRangeInput {
  @Field()
  from: string;

  @Field()
  to: string;
}