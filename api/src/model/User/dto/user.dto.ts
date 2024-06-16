// src/user/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  statut_verif_identite_user: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type_user: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password_user: string;

  @ApiProperty()
  subscription: {
    id: number;
  };
}
