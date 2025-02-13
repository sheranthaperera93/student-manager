import { ObjectType, Field } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class Response {
  @Field()
  message: string;

  @Field(() => GraphQLJSON, { nullable: true })
  data: any;
}