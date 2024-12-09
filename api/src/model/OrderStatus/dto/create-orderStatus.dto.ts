// src/dto/create-orderStatus.dto.ts
import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderStatusDto {
  @IsNotEmpty()
  @ApiProperty()
  label: string;
}