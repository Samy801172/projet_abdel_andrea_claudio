// src/model/Payment/dto/create-payment.dto.ts
import { IsNotEmpty, IsNumber, IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PaymentMethodEnum {
  PAYPAL = 'PayPal',
  STRIPE = 'Stripe',
  CREDIT_CARD = 'Credit Card'
}

export enum PaymentStatusEnum {
  COMPLETED = 'Completed',
  PENDING = 'Pending',
  FAILED = 'Failed'
}

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID de la commande associée au paiement',
    example: 1,
    required: true,
    type: Number
  })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({
    description: 'Méthode de paiement utilisée',
    enum: PaymentMethodEnum,
    enumName: 'PaymentMethodEnum',
    example: PaymentMethodEnum.PAYPAL,
    required: true
  })
  @IsEnum(PaymentMethodEnum)
  @IsNotEmpty()
  paymentMethod: PaymentMethodEnum;

  @ApiProperty({
    description: 'Montant du paiement',
    example: 99.99,
    required: true,
    type: Number,
    minimum: 0
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'Statut du paiement',
    enum: PaymentStatusEnum,
    enumName: 'PaymentStatusEnum',
    example: PaymentStatusEnum.COMPLETED,
    required: true
  })
  @IsEnum(PaymentStatusEnum)
  @IsNotEmpty()
  paymentStatus: PaymentStatusEnum;
}