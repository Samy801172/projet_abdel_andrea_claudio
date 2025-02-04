// src/models/prescription/dto/create-prescription.dto.ts
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsDate,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from "class-transformer";

export class CreatePrescriptionDto {
  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value, 10)) // Convertit en nombre
  client_id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  prescribed_by: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  medication_details: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => (value ? new Date(value) : new Date())) // Ajoute une date par défaut
  @ApiProperty({ required: false })
  expiry_date?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  file_url?: string;

  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true) // Convertit en booléen
  @ApiProperty({ default: false })
  is_custom: boolean;

  @IsString()
  @IsOptional()
  @ApiProperty({ required: false })
  notes?: string;
}
