import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaModule } from './kafka/kafka.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloServerPluginInlineTrace } from '@apollo/server/plugin/inlineTrace';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Course } from 'src/entities/course.entity';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
        path: './src/user-schema.gql',
      },
      plugins: [ApolloServerPluginInlineTrace()],
      buildSchemaOptions: {
        orphanedTypes: [Course],
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available
      envFilePath: '.env', // Path to your environment file
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService) => ({
        type: 'postgres',
        host: configService.get('POSTGRES_HOST'),
        port: configService.get('POSTGRES_PORT'),
        username: configService.get('POSTGRES_USERNAME'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DATABASE'),
        synchronize: false, // Enable auto-sync
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/migrations/*{.ts,.js}'],
        migrationsRun: true,
        autoLoadEntities: true,
        logging: true,
      }),
      inject: [ConfigService]
    }),
    UsersModule,
    KafkaModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
