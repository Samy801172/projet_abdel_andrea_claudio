import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ManufacturingRequestDto {
  @ApiProperty({
    example: 'capsules',
    description: 'Type de médicament'
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    example: 'Amoxicilline 500mg + Codéine 30mg',
    description: 'Description de la composition'
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  instructions?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Fichier d\'ordonnance (PDF, JPEG, PNG)',
    required: false
  })
  @IsOptional()
  prescriptionFile?: string;

  @ApiProperty({
    required: false,
    type: 'object'
  })
  @IsOptional()
  prescriptionDetails?: {
    doctor: {
      name: string;
      address: string;
      rpps: string;
    };
    prescription: {
      date: string;
      patient: string;
      composition: Array<{
        name: string;
        dosage: string;
      }>;
      posology: string;
      duration: string;
    };
  };
} 