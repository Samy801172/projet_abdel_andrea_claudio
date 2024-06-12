import { IsNumber, IsOptional } from 'class-validator';

export class UpdateTransactionDto {
  @IsOptional()
  typeTransaction?: string;

  @IsOptional()
  @IsNumber()
  amount_transaction?: number;

  @IsOptional()
  type_money_transaction?: string;

  @IsOptional()
  date_transaction?: Date;

  @IsOptional()
  hour_transaction?: Date;

  @IsOptional()
  @IsNumber()
  price_transaction?: number;

  @IsOptional()
  @IsNumber()
  user_id_fk?: number;
}
