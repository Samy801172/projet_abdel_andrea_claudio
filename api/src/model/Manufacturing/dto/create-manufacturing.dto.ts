import { IsString, IsNotEmpty, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ManufacturingStatus } from '../enums/manufacturing-status.enum';

export class CreateManufacturingDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsString()
  @IsOptional()
  prescriptionPath?: string;

  @IsNumber()
  @IsOptional()
  clientId?: number;

  @IsNumber()
  @IsOptional()
  estimatedPrice?: number;

  @IsNumber()
  @IsOptional()
  depositAmount?: number;

  @IsEnum(ManufacturingStatus)
  @IsOptional()
  status?: ManufacturingStatus;
} 