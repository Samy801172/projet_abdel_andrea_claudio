import { IsOptional, IsNumber, IsDateString } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  typeTransaction?: string;

  @IsOptional()
  @IsNumber()
  amount_transaction?: number;

  @IsOptional()
  type_money_transaction?: string;

  @IsOptional()
  @IsDateString()
  date_transaction?: string;

  @IsOptional()
  @IsDateString()
  hour_transaction?: string;

  @IsOptional()
  @IsNumber()
  price_transaction?: number;

  @IsOptional()
  @IsNumber()
  user_id_fk?: number;
}
