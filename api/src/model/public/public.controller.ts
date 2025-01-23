import { Controller, Get } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  // Endpoint pour récupérer le nombre total de commandes
  @Get('order-count')
  async getOrderCount(): Promise<number> {
    return this.publicService.getOrderCount();
  }

  // chargement du nombre de rendez-vous non confirmés
  @Get('pending-count')
  async getPendingAppointmentsCount(): Promise<number> {
    return this.publicService.appointmentCount();
  }

// chargement du nombre de rendez-vous non confirmés
  @Get('confirmed-count')
  async getConfirmedAppointmentsCount(): Promise<number> {
    return this.publicService.appointmentCountConfirmed();
  }

  // chargement du nombre de rendez-vous non confirmés
  @Get('canceled-count')
  async getCanceledAppointmentsCount(): Promise<number> {
    return this.publicService.appointmentCountCanceled();
  }


}