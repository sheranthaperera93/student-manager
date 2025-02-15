import { BullModule } from '@nestjs/bull';

// This is the redis server configuration
// Modify to accept values from environment
export const BullConfig = BullModule.forRoot({
  redis: {
    host: 'localhost', // Redis server host
    port: 6379, // Redis server port
  },
});
