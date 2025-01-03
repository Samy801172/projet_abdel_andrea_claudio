// src/model/Paypal/dto/paypal-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum PaypalOrderStatus {
  CREATED = 'CREATED',
  SAVED = 'SAVED',
  APPROVED = 'APPROVED',
  VOIDED = 'VOIDED',
  COMPLETED = 'COMPLETED',
  PAYER_ACTION_REQUIRED = 'PAYER_ACTION_REQUIRED'
}

class PaypalAmount {
  @ApiProperty({ example: '99.99' })
  @IsString()
  value: string;

  @ApiProperty({ example: 'EUR' })
  @IsString()
  currency_code: string;
}

class PaypalPurchaseUnit {
  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => PaypalAmount)
  amount: PaypalAmount;

  @ApiProperty({ example: 'ORDER-123' })
  @IsString()
  reference_id?: string;
}

class PaypalPayer {
  @ApiProperty({ example: 'client@example.com' })
  @IsString()
  email_address: string;

  @ApiProperty({ example: 'PAYPAL_USER_ID' })
  @IsString()
  payer_id: string;

  @ApiProperty()
  @IsObject()
  name?: {
    given_name: string;
    surname: string;
  };
}

export class PaypalOrderResponseDto {
  @ApiProperty({ example: 'PAY-1AB23456CD789012EF34GHIJ' })
  @IsString()
  id: string;

  @ApiProperty({ enum: PaypalOrderStatus })
  @IsEnum(PaypalOrderStatus)
  status: PaypalOrderStatus;

  @ApiProperty({ type: [PaypalPurchaseUnit] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PaypalPurchaseUnit)
  purchase_units: PaypalPurchaseUnit[];

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => PaypalPayer)
  payer?: PaypalPayer;

  @ApiProperty()
  create_time?: string;

  @ApiProperty()
  update_time?: string;

  @ApiProperty({ example: 'https://api.sandbox.paypal.com/v2/checkout/orders/...' })
  @IsString()
  links?: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export class PaypalErrorResponse {
  @ApiProperty({ example: 'INVALID_REQUEST' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Request is not well-formed' })
  @IsString()
  message: string;

  @ApiProperty({ example: 'INVALID_REQUEST' })
  @IsString()
  debug_id?: string;

  @ApiProperty()
  details?: Array<{
    field: string;
    value: string;
    location: string;
    issue: string;
  }>;
}