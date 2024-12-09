// src/dto/update-order.dto.ts
import { IsNotEmpty } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderDto } from './create-order.dto';

export class UpdateOrderDto extends PartialType(CreateOrderDto)  {
  @IsNotEmpty()
  date_order: Date;

  @IsNotEmpty()
  clientId: number; // The ID of the client
}
