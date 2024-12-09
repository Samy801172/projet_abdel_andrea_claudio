// src/model/Order/dto/order-line.dto.ts
import { IsNumber, IsPositive, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// order-line.dto.ts
export class OrderLineDto {
  @IsNumber()
  id_product: number;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  unit_price: number;
}