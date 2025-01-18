// src/dto/update-client.dto.ts
import { ApiProperty, PartialType } from "@nestjs/swagger";
import { CreateClientDto } from './create-client.dto';
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class UpdateClientDto extends PartialType(CreateClientDto) {

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  address?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  firstName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  lastName?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  avatar?: string;
}
