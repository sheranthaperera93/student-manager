import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateJobQueue1739511385717 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'job_queue',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'jobData',
            type: 'text',
          },
          {
            name: 'status',
            type: 'int',
          },
          {
            name: 'createdDate',
            type: 'date',
          },
          {
            name: 'jobCompleteDate',
            type: 'date',
            isNullable: true
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('job_queue');
  }
}
