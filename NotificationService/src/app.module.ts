import { Module } from '@nestjs/common';
import { EventsModule } from './events/events.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config globally available
      envFilePath: '.env', // Path to your environment file
    }),
    EventsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
