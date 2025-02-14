import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDummyUsers1739425798757 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .insert()
      .into('user')
      .values([
        {
          name: 'Sherantha Perera',
          date_of_birth: '1993-07-14',
          email: 'sheranthap@fortude.co',
        },
        {
          name: 'John Doe',
          date_of_birth: '1990-01-01',
          email: 'john.doe@example.com',
        },
        {
          name: 'Jane Smith',
          date_of_birth: '1992-02-02',
          email: 'jane.smith@example.com',
        },
        {
          name: 'Alice Johnson',
          date_of_birth: '1991-03-03',
          email: 'alice.johnson@example.com',
        },
        {
          name: 'Bob Brown',
          date_of_birth: '1993-04-04',
          email: 'bob.brown@example.com',
        },
        {
          name: 'Charlie Davis',
          date_of_birth: '1994-05-05',
          email: 'charlie.davis@example.com',
        },
        {
          name: 'David Evans',
          date_of_birth: '1995-06-06',
          email: 'david.evans@example.com',
        },
        {
          name: 'Eve Foster',
          date_of_birth: '1996-07-07',
          email: 'eve.foster@example.com',
        },
        {
          name: 'Frank Green',
          date_of_birth: '1997-08-08',
          email: 'frank.green@example.com',
        },
        {
          name: 'Grace Harris',
          date_of_birth: '1998-09-09',
          email: 'grace.harris@example.com',
        },
        {
          name: 'Hank Irving',
          date_of_birth: '1999-10-10',
          email: 'hank.irving@example.com',
        },
        {
          name: 'Ivy Johnson',
          date_of_birth: '2000-11-11',
          email: 'ivy.johnson@example.com',
        },
        {
          name: 'Jack King',
          date_of_birth: '2001-12-12',
          email: 'jack.king@example.com',
        },
        {
          name: 'Karen Lee',
          date_of_birth: '2002-01-13',
          email: 'karen.lee@example.com',
        },
        {
          name: 'Leo Martin',
          date_of_birth: '2003-02-14',
          email: 'leo.martin@example.com',
        },
        {
          name: 'Mia Nelson',
          date_of_birth: '2004-03-15',
          email: 'mia.nelson@example.com',
        },
        {
          name: 'Nina Owens',
          date_of_birth: '2005-04-16',
          email: 'nina.owens@example.com',
        },
        {
          name: 'Oscar Perez',
          date_of_birth: '2006-05-17',
          email: 'oscar.perez@example.com',
        },
        {
          name: 'Paul Quinn',
          date_of_birth: '2007-06-18',
          email: 'paul.quinn@example.com',
        },
        {
          name: 'Quincy Roberts',
          date_of_birth: '2008-07-19',
          email: 'quincy.roberts@example.com',
        },
      ])
      .execute();
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.manager
      .createQueryBuilder()
      .delete()
      .from('user')
      .where('email IN (:...emails)', {
        emails: [
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
          'quincy.roberts@example.com',
        ],
      })
      .execute();
  }
}
