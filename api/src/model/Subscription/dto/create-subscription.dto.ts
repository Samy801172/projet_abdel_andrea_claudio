import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateSubscriptionDto {
  @IsNotEmpty()
  @IsString()
  name_subscription: string;

  @IsNotEmpty()
  @IsNumber()
  price_subscription: number;

  @IsNotEmpty()
  @IsString()
  description_subscription: string;

  @IsNotEmpty()
  @IsNumber()
  duration_subscription_d: number;
}
