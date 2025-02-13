import { IsNotEmpty, IsNumber, Min } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

// src/model/Order/dto/create-order.dto.ts
export class CreateOrderDto {

  @ApiProperty()
  @IsNotEmpty()
  clientId: number;
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  productId: number;
  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;
  @ApiProperty()
  @IsNumber()
  @Min(0)
  unitPrice: number;
}