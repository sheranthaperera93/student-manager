import {
  IsString,
  Length,
  IsNotEmpty,
  IsEmail,
  IsDateString,
} from 'class-validator';
import { Field, InputType, PartialType } from '@nestjs/graphql';

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
export class UserInputDTO extends PartialType(UserInputBase) {}
