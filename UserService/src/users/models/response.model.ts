import { ObjectType, Field, Directive } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class Response {
  @Field()
  @Directive('@shareable')
  message: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Directive('@shareable')
  data: any;
}