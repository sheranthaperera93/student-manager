import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateUserInput {
  @Field({ nullable: false })
  name: string;

  @Field({ nullable: false })
  email: string;

  @Field({ nullable: false })
  date_of_birth: Date;
}
