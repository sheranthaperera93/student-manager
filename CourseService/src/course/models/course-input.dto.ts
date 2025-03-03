import { IsString, Length, IsNotEmpty } from 'class-validator';
import { Field, InputType, PartialType } from '@nestjs/graphql';

@InputType()
export class CourseInputBase {
  @Field()
  @IsString()
  @Length(1, 255)
  @IsNotEmpty()
  name: string;

  @Field()
  @IsString()
  @Length(1, 255)
  @IsNotEmpty()
  description: string;
}

@InputType()
export class CourseInputDTO extends PartialType(CourseInputBase) {}
