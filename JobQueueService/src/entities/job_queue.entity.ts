import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('job_queue')
@ObjectType()
export class JobQueue {
  @Field(type => Int)
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column('text')
  jobData: string;

  @Field()
  @Column('int')
  status: number;

  @Field()
  @Column('int')
  type: number;

  @Field()
  @Column('date')
  createdDate: Date;

  @Field()
  @Column('date', { nullable: true })
  jobCompleteDate: Date;
}
