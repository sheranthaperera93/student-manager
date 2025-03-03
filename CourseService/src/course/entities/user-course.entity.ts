import { Directive, Field, ID, ObjectType } from '@nestjs/graphql';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_course')
@Directive('@key(fields: "id")')
@ObjectType()
export class UserCourse {
  @Field((type) => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => ID)
  @Column()
  userId: number;

  @Field(() => ID)
  @Column()
  courseId: number;
}