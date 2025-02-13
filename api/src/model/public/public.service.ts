import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../Order/order.entity'; // Chemin vers l'entité Order
import {
  Prescription,
  PrescriptionStatus,
} from '../Prescription/prescription.entity'; // Chemin vers l'entité Order
import { Appointment } from '../Appointment/appointment.entity';

@Injectable()
export class PublicService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Prescription)
    private readonly prescriptionRepository: Repository<Prescription>,
  ) {}

  // Méthode pour compter le nombre de commandes
  async getOrderCount(): Promise<number> {
    return this.orderRepository.count();
  }

  // Compter le nombre de rendez-vous non confirmer pour le dashboard
  async appointmentCount(): Promise<number> {
    return this.appointmentRepository.count({
      where: { status: 'en attente' },
    });
  }

  // Compter le nombre de rendez-vous non confirmé pour le dashboard
  async appointmentCountConfirmed(): Promise<number> {
    return this.appointmentRepository.count({ where: { status: 'confirmé' } });
  }

  // Compter le nombre de rendez-vous annulé
  async appointmentCountCanceled(): Promise<number> {
    return this.appointmentRepository.count({ where: { status: 'confirmé' } });
  }

  //////////////////////ORDERS///////////////////////////

  // Compter le nombre de commandes non confirmées pour le dashboard
  async orderCount(): Promise<number> {
    return this.orderRepository.count({ where: { id_statut: 2 } });
  }

  // Compter le nombre de rendez-vous non confirmé pour le dashboard
  async orderCountConfirmed(): Promise<number> {
    return this.orderRepository.count({ where: { id_statut: 3 } });
  }

  // Compter le nombre de rendez-vous annulé
  async orderCountCanceled(): Promise<number> {
    return this.orderRepository.count({ where: { id_statut: 5 } });
  }

  // Compter le nombre d'ordonnance' non confirmées pour le dashboard
  async ordonnanceCount(): Promise<number> {
    return this.prescriptionRepository.count({
      where: { status: PrescriptionStatus.PENDING },
    });
  }
}
