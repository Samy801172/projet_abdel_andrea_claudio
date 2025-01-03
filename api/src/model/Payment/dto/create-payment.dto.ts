// src/model/Payment/dto/create-payment.dto.ts
import { IsNotEmpty, IsNumber, IsEnum, Min, IsOptional, IsString, MaxLength, Matches } from 'class-validator';
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
  @ApiProperty({
    description: 'ID de la commande associée au paiement',
    example: 1,
    required: true,
    type: Number
  })
  @ApiProperty()
  @IsNumber({}, { message: 'L\'ID de la commande doit être un nombre.' })
  @IsNotEmpty({ message: 'L\'ID de la commande est requis.' })
  @Min(1, { message: 'L\'ID de la commande doit être supérieur à 0.' })
  orderId: number;

  @ApiProperty({
    description: 'Méthode de paiement',
    enum: PaymentMethodEnum,
    example: PaymentMethodEnum.PAYPAL,
    required: true
  })
  @ApiProperty()
  @IsEnum(PaymentMethodEnum, {
    message: `La méthode de paiement doit être l'une des suivantes: ${Object.values(PaymentMethodEnum).join(', ')}`
  })
  @ApiProperty()
  @IsNotEmpty({ message: 'La méthode de paiement est requise.' })
  paymentMethod: PaymentMethodEnum;

  @ApiProperty({
    description: 'Montant du paiement en euros',
    example: 99.99,
    required: true,
    type: Number,
    minimum: 0
  })
  @ApiProperty()
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Le montant doit être un nombre avec maximum 2 décimales.' }
  )
  @ApiProperty()
  @IsNotEmpty({ message: 'Le montant est requis.' })
  @Min(0.01, { message: 'Le montant doit être supérieur à 0.' })
  amount: number;

  @ApiProperty({
    description: 'Statut du paiement',
    enum: PaymentStatusEnum,
    example: PaymentStatusEnum.PENDING,
    required: true
  })
  @ApiProperty()
  @IsEnum(PaymentStatusEnum, {
    message: `Le statut doit être l'un des suivants: ${Object.values(PaymentStatusEnum).join(', ')}`
  })
  @ApiProperty()
  @IsNotEmpty({ message: 'Le statut du paiement est requis.' })
  paymentStatus: PaymentStatusEnum;
  @ApiProperty()
  @ApiPropertyOptional({
    description: 'ID de transaction PayPal',
    example: 'PAY-1AB23456CD789012EF34GHIJ',
    maxLength: 50
  })
  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'L\'ID PayPal doit être une chaîne de caractères.' })
  @MaxLength(50, { message: 'L\'ID PayPal ne peut pas dépasser 50 caractères.' })
  @Matches(/^[A-Za-z0-9\-_]+$/, {
    message: 'L\'ID PayPal ne peut contenir que des lettres, chiffres, tirets et underscores.'
  })
  paypalOrderId?: string;

  @ApiPropertyOptional({
    description: 'ID de transaction interne',
    example: 'TXN-123456789',
    maxLength: 30
  })
  @ApiProperty()
  @IsOptional()
  @IsString({ message: 'L\'ID de transaction doit être une chaîne de caractères.' })
  @MaxLength(30, { message: 'L\'ID de transaction ne peut pas dépasser 30 caractères.' })
  @Matches(/^[A-Za-z0-9\-]+$/, {
    message: 'L\'ID de transaction ne peut contenir que des lettres, chiffres et tirets.'
  })
  transactionId?: string;
}
