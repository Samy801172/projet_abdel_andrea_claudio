import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  name_subscription: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  price_subscription: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  description_subscription: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  duration_subscription_d: number;
}
