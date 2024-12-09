// src/model/Order/dto/create-order.dto.ts
import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsPositive, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { OrderLineDto } from './order-line.dto';

export class CreateOrderDto {
  @ApiProperty({ description: 'ID du client' })
  @IsNumber()
  @IsPositive()
  id_client: number;

  @ApiProperty({ description: 'ID du statut' })
  @IsNumber()
  @IsPositive()
  id_statut: number;

  @ApiProperty({ description: 'Date de la commande' })
  @IsDate()
  @Type(() => Date)
  date_order: Date;

  @ApiProperty({ description: 'Lignes de commande', type: [OrderLineDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLineDto)
  orderLines: OrderLineDto[];
}