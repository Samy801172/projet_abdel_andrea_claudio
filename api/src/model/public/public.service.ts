import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../Order/order.entity'; // Chemin vers l'entité Order
import { Appointment } from '../Appointment/appointment.entity';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
  ) {}

  // Méthode pour compter le nombre de commandes
  async getOrderCount(): Promise<number> {
    return this.orderRepository.count();
  }

  // Compter le nombre de rendez-vous non confirmer pour le dashboard
  async appointmentCount(): Promise<number> {
    try {
      const count = await this.appointmentRepository.count({
        where: { status: 'en attente' },
      });
      console.log('Requête envoyée à la base :', {
        table: 'appointment',
        condition: { status: 'en attente' },
        count,
      });
      return count;
    } catch (error) {
      console.error('Erreur lors du comptage des rendez-vous non confirmés :', error);
      throw error;
    }
  }


}
