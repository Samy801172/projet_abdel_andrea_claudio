import { IsNotEmpty, IsString, IsEmail, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  phone: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  statut_verif_identite_user: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  type_user: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  password: string;


  @IsNumber()
  @IsOptional()
  subscriptionId?: number;
}
