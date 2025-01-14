import { IsNotEmpty, IsString } from 'class-validator';
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
  @IsNotEmpty()
  @ApiProperty()
  avatar: string;

  @IsNotEmpty()
  @ApiProperty()
  address: string;

  @IsNotEmpty()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @ApiProperty()
  password: string;
}
