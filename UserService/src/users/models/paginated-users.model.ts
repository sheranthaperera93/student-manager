import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User } from 'src/entities/user.entity';

@ObjectType()
export class PaginatedUsers {
  @Field(() => [User])
  items: User[];

  @Field(() => Int)
  total: number;
}
