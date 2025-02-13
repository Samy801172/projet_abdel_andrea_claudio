// src/model/Payment/dto/paypal-order.dto.ts
import { IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PaypalOrderDto {
  @ApiProperty()
  @IsNumber()
  clientId: number;

  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ type: 'array' })
  @IsArray()
  cartItems: any[];
}