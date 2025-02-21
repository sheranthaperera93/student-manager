import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  afterInit(server: Server) {
    Logger.log('WebSocket server initialized');
  }

  handleConnection(client: Socket, ...args: any[]) {
    Logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    Logger.log(`Client disconnected: ${client.id}`);
  }

  // The method sends a broadcast message to all clients
  @SubscribeMessage('message')
  handleMessage(payload: string): void {
    this.server.emit('message', payload);
  }

  sendMessageToClient(clientId: string, message: string): void {
    const client = this.server.sockets.sockets.get(clientId);
    if (client) {
      client.emit('message', message); // Send to a specific client
    }
  }
}
