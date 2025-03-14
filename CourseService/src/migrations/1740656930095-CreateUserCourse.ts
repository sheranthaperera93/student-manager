import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateUserCourse1740656930095 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create user_course table
    await queryRunner.createTable(
      new Table({
        name: 'user_course',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'uuid',
            default: `uuid_generate_v4()`,
          },
          {
            name: 'userId',
            type: 'int',
          },
          {
            name: 'courseId',
            type: 'int',
          },
        ],
      }),
      true,
    );

    // Add foreign keys
    await queryRunner.createForeignKey(
      'user_course',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'user_course',
      new TableForeignKey({
        columnNames: ['courseId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'course',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys
    const table = await queryRunner.getTable('user_course');
    const foreignKeys = table!.foreignKeys.filter(
      (fk) =>
        fk.columnNames.indexOf('userId') !== -1 ||
        fk.columnNames.indexOf('courseId') !== -1,
    );
    await queryRunner.dropForeignKeys('user_course', foreignKeys);

    // Drop user_course table
    await queryRunner.dropTable('user_course');
  }
}
