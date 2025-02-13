import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1739424788920 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user" (
                "id" SERIAL PRIMARY KEY,
                "name" VARCHAR(255) NOT NULL,
                "date_of_birth" DATE NOT NULL,
                "email" VARCHAR(255) NOT NULL UNIQUE
            )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
  }
}
