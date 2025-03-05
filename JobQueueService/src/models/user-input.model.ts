import { Optional } from '@nestjs/common';
import { Field, InputType, PartialType } from '@nestjs/graphql';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';

@InputType()
export class UserInputBase {
  @Field()
  @IsString()
  @Length(1, 255)
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @IsEmail()
  @Length(1, 255)
  @IsNotEmpty()
  email: string;

  @Field()
  @IsDateString()
  @IsNotEmpty()
  date_of_birth: Date;
}

@InputType()
export class UserInputDTO extends PartialType(UserInputBase) {
  @Field(() => [Number], { nullable: true })
  @IsArray()
  @Optional()
  @IsNumber({}, { each: true })
  courses?: number[];
}
