import { IsNotEmpty, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { JoinColumn, ManyToOne } from "typeorm";
import { Service } from "../../Service/service.entity";
import { Client } from "../../Client/client.entity";

export class CreateAppointmentDto {
  @IsNotEmpty()
  @ApiProperty({ description: "Date du rendez-vous", example: "2025-01-21" })
  appointmentDate: Date;

  @IsNotEmpty()
  @ApiProperty({ description: "Heure du rendez-vous", example: "14:00" })
  time: string;

  @IsNotEmpty()
  @ApiProperty({ description: "ID du service associé au rendez-vous", example: 1 })
  serviceId: number;

  @IsNotEmpty()
  @ApiProperty({ description: "ID du client", example: 123 })
  clientId: number;

  @ApiProperty({ description: "Notes associées au rendez-vous", example: "Apportez vos documents" })
  note: string;

  @IsNotEmpty()
  @ApiProperty({ description: "Statut du rendez-vous", example: "en attente" })
  status: string;
}
