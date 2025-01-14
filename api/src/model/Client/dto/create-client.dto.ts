import { IsBoolean, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';
import { Column } from "typeorm";

export class CreateClientDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName: string;

  @IsString()
  @ApiProperty({ required: false }) // Avatar optionnel
  avatar?: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  address: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ default: false }) // Par défaut, pas admin
  isAdmin: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({ default: true }) // Par défaut, actif
  active: boolean;
}
