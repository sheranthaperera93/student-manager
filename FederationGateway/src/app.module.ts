import { IntrospectAndCompose } from '@apollo/gateway';
import { ApolloGatewayDriver, ApolloGatewayDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    GraphQLModule.forRootAsync<ApolloGatewayDriverConfig>({
      driver: ApolloGatewayDriver,
      useFactory: (configService) => ({
        gateway: {
          supergraphSdl: new IntrospectAndCompose({
            subgraphs: [
              { name: 'users', url: 'http://localhost:3002/graphql' },
              { name: 'jobqueue', url: 'http://localhost:3006/graphql' },
            ],
          }),
        },
      }),
      inject: [ConfigService]
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
