import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  async notifyClient(clientId: number, message: string) {
    this.logger.debug(`Notification envoyée au client ${clientId}: ${message}`);
    // TODO: Implémenter la notification réelle (email, websocket, etc.)
    return true;
  }
} 