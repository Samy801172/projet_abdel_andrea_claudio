import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Manufacturing } from './manufacturing.entity';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true
  }
})
export class ManufacturingGateway {
  private readonly logger = new Logger(ManufacturingGateway.name);
  
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('manufacturing-status-update')
  handleStatusUpdate(client: any, manufacturing: Manufacturing) {
    this.logger.debug(`Broadcasting status update for manufacturing #${manufacturing.id}`);
    // Broadcast la mise à jour à tous les clients connectés
    this.server.emit('manufacturing-status-update', manufacturing);
  }
} 