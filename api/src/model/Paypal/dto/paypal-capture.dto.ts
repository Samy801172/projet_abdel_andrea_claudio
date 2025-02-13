// src/model/Paypal/dto/paypal-capture.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PaypalCaptureRequestDto {
  @ApiProperty({ example: 'PAY-1AB23456CD789012EF34GHIJ' })
  @IsString()
  orderId: string;
}