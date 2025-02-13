import { Injectable } from '@nestjs/common';
import { ManufacturingStatus } from '../enums/manufacturing-status.enum';

@Injectable()
export class ManufacturingNotificationService {
  async notifyManufacturingStatus(manufacturingId: number, status: ManufacturingStatus) {
    // Envoi d'emails ou notifications push
  }

  async notifyManufacturingComplete(manufacturingId: number) {
    // Notification de disponibilité du médicament
  }
} 