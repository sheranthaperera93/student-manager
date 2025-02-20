import {
  Field,
  ID,
  ObjectType,
  InputType,
  PartialType,
  Directive,
} from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import {
  IsString,
  Length,
  IsNotEmpty,
  IsEmail,
  IsDateString,
} from 'class-validator';

@Entity('user')
@Directive('@key(fields: "id")')
@ObjectType()
export class User {
  @Field((type) => ID)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  email: string;

  @Field()
  @Column()
  date_of_birth: Date;
}

@InputType()
export class UserInput {
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
export class UpdateUserPayload extends PartialType(UserInput) {}
