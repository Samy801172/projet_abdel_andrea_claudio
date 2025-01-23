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

  async create(createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    // Vérifie si le service existe
    const service = await this.serviceRepository.findOneBy({
      id: createAppointmentDto.serviceId, // Vérification sur le Service
    });
    if (!service) {
      throw new NotFoundException(`Service avec l'ID ${createAppointmentDto.serviceId} introuvable.`);
    }

    // Vérifie si le client existe
    const client = await this.clientRepository.findOneBy({
      clientId: createAppointmentDto.clientId, // Vérification sur le Client
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

  // Pour récupérer tous les rendez vous
  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: ['service', 'client'],
    });
  }

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

  async update(id: number, updateAppointmentDto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.findOne(id); // Charge l'entité existante
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found.`);
    }
    Object.assign(appointment, updateAppointmentDto); // Met à jour les champs
    return this.appointmentRepository.save(appointment); // Met à jour l'entité existante
  }


  async remove(id: number): Promise<void> {
    const appointment = await this.findOne(id);
    await this.appointmentRepository.remove(appointment);
  }

  // Change le status de rendez vous
  async updateStatus(id: number, status: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOneBy({ appointmentId: id });

    if (!appointment) {
      throw new NotFoundException(`Rendez-vous avec l'ID ${id} introuvable.`);
    }

    appointment.status = status;
    return this.appointmentRepository.save(appointment);
  }

  // trouve tous les rendez vous concernant un client par son id
  async findByClient(clientId: number): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { clientId },
      relations: ['service'], // Inclure les relations si nécessaire (comme le service associé)
    });
  }




}
