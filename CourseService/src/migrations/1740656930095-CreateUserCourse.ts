import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from "typeorm";

export class CreateUserCourse1740656930095 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove userId column from course table
        await queryRunner.dropColumn('course', 'userId');

        // Create user_course table
        await queryRunner.createTable(new Table({
            name: 'user_course',
            columns: [
                {
                    name: 'id',
                    type: 'int',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment'
                },
                {
                    name: 'userId',
                    type: 'int'
                },
                {
                    name: 'courseId',
                    type: 'int'
                }
            ]
        }), true);

        // Add foreign keys
        await queryRunner.createForeignKey('user_course', new TableForeignKey({
            columnNames: ['userId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'user',
            onDelete: 'CASCADE'
        }));

        await queryRunner.createForeignKey('user_course', new TableForeignKey({
            columnNames: ['courseId'],
            referencedColumnNames: ['id'],
            referencedTableName: 'course',
            onDelete: 'CASCADE'
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop foreign keys
        const table = await queryRunner.getTable('user_course');
        const foreignKeys = table!.foreignKeys.filter(fk => fk.columnNames.indexOf('userId') !== -1 || fk.columnNames.indexOf('courseId') !== -1);
        await queryRunner.dropForeignKeys('user_course', foreignKeys);

        // Drop user_course table
        await queryRunner.dropTable('user_course');

        // Add userId column back to course table
        await queryRunner.addColumn('course', new TableColumn({
            name: 'userId',
            type: 'int'
        }));
    }
}
