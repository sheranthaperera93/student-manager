import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('job_queue')
export class JobQueue {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  jobData: string;

  @Column('int')
  status: number;

  @Column('date')
  createdDate: Date;

  @Column('date', { nullable: true })
  jobCompleteDate: Date;
}
