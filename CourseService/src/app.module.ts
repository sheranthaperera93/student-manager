import { Module } from '@nestjs/common';
import { CourseModule } from './course/course.module';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'sheranthap',
      password: 'Test@123',
      database: 'studentmanagement',
      synchronize: false, // Enable auto-sync
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/migrations/*{.ts,.js}'],
      migrationsRun: true,
      autoLoadEntities: true,
      logging: true,
    }),
    CourseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
