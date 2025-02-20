import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCourseTable1740038294419 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'course',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'name',
            type: 'varchar',
          },
          {
            name: 'description',
            type: 'text',
          },
          {
            name: 'userId',
            type: 'int',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'course',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('course');
    const foreignKey = table!.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );
    await queryRunner.dropForeignKey('course', foreignKey!);
    await queryRunner.dropTable('course');
  }
}
