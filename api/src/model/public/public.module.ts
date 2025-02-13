import { Module } from '@nestjs/common';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from '../Order/order.entity';
import { Appointment } from "../Appointment/appointment.entity"; // Chemin vers l'entité Order
import { Prescription } from '../Prescription/prescription.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Appointment]), TypeOrmModule.forFeature([Prescription])],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
