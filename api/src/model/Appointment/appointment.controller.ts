// src/controllers/appointment.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch
} from "@nestjs/common";

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from "./appointment.entity";

// Définition des métadonnées Swagger pour la documentation
@ApiTags('appointments')
@ApiBearerAuth('access-token')
@Controller('appointments')
export class AppointmentController {
  // Injection du service AppointmentService pour la gestion des rendez-vous
  constructor(private readonly appointmentService: AppointmentService) {}

  // Création d'un nouveau rendez-vous
  @Post('ajoutRendezVous')
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  // Récupération de tous les rendez-vous
  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }

  // Récupération des rendez-vous d'un client spécifique via son ID
  @Get(':clientId/myAppointments')
  findByClient(@Param('clientId') clientId: string) {
    return this.appointmentService.findByClient(+clientId);
  }

  // Mise à jour d'un rendez-vous spécifique
  @Put(':id/miseAjour')
  update(
    @Param('id') id: number,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(+id, updateAppointmentDto);
  }

  // Mise à jour du statut d'un rendez-vous (ex: passage de "en attente" à "confirmé")
  @Patch(':id/changeStatus')
  async updateStatus(
    @Param('id') id: number,
    @Body('status') status: string
  ): Promise<Appointment> {
    return this.appointmentService.updateStatus(id, status);
  }

  // Suppression d'un rendez-vous
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(+id);
  }

  ///////////////////////////////////////////////////////

  // Suppression d'un rendez-vous par un administrateur
  @Delete(':id/deleteAdmin')
  removeAdmin(@Param('id') id: number): Promise<void> {
    return this.appointmentService.remove(id);
  }
}
