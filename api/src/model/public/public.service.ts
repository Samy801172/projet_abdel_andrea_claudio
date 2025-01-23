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
    return this.appointmentRepository.count({ where: { status: 'en attente' } });
  }

  // Compter le nombre de rendez-vous non confirmé pour le dashboard
  async appointmentCountConfirmed(): Promise<number> {
    return this.appointmentRepository.count({ where: { status: 'confirmé' } });
  }

// Compter le nombre de rendez-vous annulé
  async appointmentCountCanceled(): Promise<number> {
    return this.appointmentRepository.count({ where: { status: 'confirmé' } });
  }

}
