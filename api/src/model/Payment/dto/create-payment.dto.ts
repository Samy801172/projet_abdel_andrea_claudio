// src/model/Payment/dto/create-payment.dto.ts
import { IsNotEmpty, IsNumber, IsEnum, Min, IsOptional, IsString, MaxLength, Matches, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethodEnum {
  PAYPAL = 'PayPal',
  BANCONTACT = 'Bancontact',
  CREDIT_CARD = 'Credit Card',
  BANK_TRANSFER = 'Bank Transfer'
}

export enum PaymentStatusEnum {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export class CreatePaymentDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  clientId: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  manufacturingRequestId?: number;

  @ApiProperty()
  @IsEnum(PaymentMethodEnum)
  paymentMethod: PaymentMethodEnum;

  @ApiProperty()
  @IsEnum(PaymentStatusEnum)
  paymentStatus: PaymentStatusEnum;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paypalOrderId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isDeposit?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  prescriptionFile?: string;
}
