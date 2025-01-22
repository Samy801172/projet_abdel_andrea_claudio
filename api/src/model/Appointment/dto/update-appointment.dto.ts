// src/dto/update-appointment.dto.ts
import { IsNotEmpty } from "class-validator";

export class UpdateAppointmentDto {
  appointmentDate?: Date;

  time?: string;

  serviceId?: number;

  @IsNotEmpty()
  clientId?: number;
  administratorId?: number;

  @IsNotEmpty()
  status?: string;

  note?: string;
}
