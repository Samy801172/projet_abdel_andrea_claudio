// src/controllers/appointment.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete, Patch
} from "@nestjs/common";

import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from "./appointment.entity";
@ApiTags('appointments')
@ApiBearerAuth('access-token')
@Controller('appointments')
export class AppointmentController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post('ajoutRendezVous')
  create(@Body() createAppointmentDto: CreateAppointmentDto) {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }

  @Get(':clientId/myAppointments')
  findByClient(@Param('clientId') clientId: string) {
    return this.appointmentService.findByClient(+clientId);
  }


  @Put(':id/miseAjour')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(+id, updateAppointmentDto);
  }

  // Ici on change le status en attente vers confirmé
  @Patch(':id/changeStatus')
  async updateStatus(
    @Param('id') id: number,
    @Body('status') status: string
  ): Promise<Appointment> {
    return this.appointmentService.updateStatus(id, status);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(+id);
  }

  ///////////////////////////////////////////////////////

  @Delete(':id/deleteAdmin')
  removeAdmin(@Param('id') id: number): Promise<void> {
    return this.appointmentService.remove(id);
  }

}
