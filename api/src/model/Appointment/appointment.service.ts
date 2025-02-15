// src/services/appointment.service.ts
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { Appointment } from './appointment.entity';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Service } from "../Service/service.entity";
import { Client } from "../Client/client.entity";

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,

    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,

    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  // Création d'un rendez-vous
  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Vérifie si le service existe
    const service = await this.serviceRepository.findOneBy({
      id: createAppointmentDto.serviceId,
    });
    if (!service) {
      throw new NotFoundException(`Service avec l'ID ${createAppointmentDto.serviceId} introuvable.`);
    }

    // Vérifie si le client existe
    const client = await this.clientRepository.findOneBy({
      clientId: createAppointmentDto.clientId,
    });
    if (!client) {
      throw new NotFoundException(`Client avec l'ID ${createAppointmentDto.clientId} introuvable.`);
    }

    // Valide la date du rendez-vous
    const appointmentDate = new Date(createAppointmentDto.appointmentDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (appointmentDate < now) {
      throw new BadRequestException('La date du rendez-vous ne peut pas être dans le passé.');
    }

    // Vérifie les conflits de rendez-vous
    const conflictingAppointment = await this.appointmentRepository.findOne({
      where: {
        appointmentDate: createAppointmentDto.appointmentDate,
        time: createAppointmentDto.time,
        serviceId: createAppointmentDto.serviceId,
      },
      relations: ['service'],
    });
    if (conflictingAppointment) {
      throw new BadRequestException('Ce créneau horaire est déjà pris pour ce service.');
    }

    // Crée et sauvegarde le rendez-vous
    const appointment = this.appointmentRepository.create({
      ...createAppointmentDto,
      service,
      client,
    });
    return this.appointmentRepository.save(appointment);
  }

  // Récupération de tous les rendez-vous
  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: ['service', 'client'],
    });
  }

  // Récupérer un rendez-vous par son ID
  async findOne(id: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { appointmentId: id },
      relations: ['service', 'client'],
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
    return appointment;
  }

  // Mise à jour d'un rendez-vous
  async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id);
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found.`);
    }
    Object.assign(appointment, updateAppointmentDto);
    return this.appointmentRepository.save(appointment);
  }

  // Suppression d'un rendez-vous
  async remove(id: number): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.remove(appointment);
  }

  // Changer le statut d'un rendez-vous
  async updateStatus(id: number, status: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOneBy({ appointmentId: id });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} introuvable.`);
    }

    appointment.status = status;
    return this.appointmentRepository.save(appointment);
  }

  // Récupérer les rendez-vous d'un client spécifique
  async findByClient(clientId: number): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { clientId },
      relations: ['service'],
    });
  }
}
