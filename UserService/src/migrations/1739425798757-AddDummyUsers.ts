import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDummyUsers1739425798757 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO "user" ("name", "date_of_birth", "email") VALUES 
            ('Sherantha Perera', '1993-07-14', 'sheranthap@fortude.co'),
            ('John Doe', '1990-01-01', 'john.doe@example.com'),
            ('Jane Smith', '1992-02-02', 'jane.smith@example.com'),
            ('Alice Johnson', '1991-03-03', 'alice.johnson@example.com'),
            ('Bob Brown', '1993-04-04', 'bob.brown@example.com'),
            ('Charlie Davis', '1994-05-05', 'charlie.davis@example.com'),
            ('David Evans', '1995-06-06', 'david.evans@example.com'),
            ('Eve Foster', '1996-07-07', 'eve.foster@example.com'),
            ('Frank Green', '1997-08-08', 'frank.green@example.com'),
            ('Grace Harris', '1998-09-09', 'grace.harris@example.com'),
            ('Hank Irving', '1999-10-10', 'hank.irving@example.com'),
            ('Ivy Johnson', '2000-11-11', 'ivy.johnson@example.com'),
            ('Jack King', '2001-12-12', 'jack.king@example.com'),
            ('Karen Lee', '2002-01-13', 'karen.lee@example.com'),
            ('Leo Martin', '2003-02-14', 'leo.martin@example.com'),
            ('Mia Nelson', '2004-03-15', 'mia.nelson@example.com'),
            ('Nina Owens', '2005-04-16', 'nina.owens@example.com'),
            ('Oscar Perez', '2006-05-17', 'oscar.perez@example.com'),
            ('Paul Quinn', '2007-06-18', 'paul.quinn@example.com'),
            ('Quincy Roberts', '2008-07-19', 'quincy.roberts@example.com')`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM "user" WHERE "email" IN (
                'sheranthap@fortude.co',
                'john.doe@example.com',
                'jane.smith@example.com',
                'alice.johnson@example.com',
                'bob.brown@example.com',
                'charlie.davis@example.com',
                'david.evans@example.com',
                'eve.foster@example.com',
                'frank.green@example.com',
                'grace.harris@example.com',
                'hank.irving@example.com',
                'ivy.johnson@example.com',
                'jack.king@example.com',
                'karen.lee@example.com',
                'leo.martin@example.com',
                'mia.nelson@example.com',
                'nina.owens@example.com',
                'oscar.perez@example.com',
                'paul.quinn@example.com',
                'quincy.roberts@example.com'
            )`
        );
    }

}