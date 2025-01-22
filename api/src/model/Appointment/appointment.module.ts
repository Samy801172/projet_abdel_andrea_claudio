// src/modules/appointment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { Appointment } from './appointment.entity';

//Tres important pour faire fonctionner l'ajout sinon bug au niveau des injections dans Service
import { Service } from '../Service/service.entity';
import { Client } from '../Client/client.entity';


@Module({
  imports: [TypeOrmModule.forFeature([Appointment, Service, Client])],
  providers: [AppointmentService],
  controllers: [AppointmentController],
})
export class AppointmentModule {}
