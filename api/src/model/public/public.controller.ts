import { Controller, Get } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  /////////////////////APPOINTMENT////////////////////////////

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

  // chargement du nombre de rendez-vous annulés
  @Get('canceled-count')
  async getCanceledAppointmentsCount(): Promise<number> {
    return this.publicService.appointmentCountCanceled();
  }

  /////////////////////ORDERS////////////////////////////

  // récupère tout
  @Get('orders')

  async findAllPublicOrders() {

  }

  // Endpoint pour récupérer le nombre total de commandes
  @Get('orders-count')
  async getOrderCount(): Promise<number> {
    return this.publicService.getOrderCount();
  }

  // chargement du nombre de commande non confirmés
  @Get('orders-pending-count')
  async getPendingOrderCount(): Promise<number> {
    return this.publicService.orderCount();
  }

  // chargement du nombre de rendez-vous non confirmés
  @Get('orders-confirmed-count')
  async getConfirmedOrdersCount(): Promise<number> {
    return this.publicService.orderCountConfirmed();
  }

  // chargement du nombre de rendez-vous annulés
  @Get('orders-canceled-count')
  async getCanceledOrdersCount(): Promise<number> {
    return this.publicService.orderCountCanceled();
  }

  ////////////////////ORDONNANCE////////////////////////

  // chargement du nombre d'ordonnances en attente
  @Get('ordonnance-pending-count')
  async getPendingOrdonnanceCount(): Promise<number> {
    return this.publicService.ordonnanceCount();
  }

}