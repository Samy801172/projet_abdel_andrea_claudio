import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  typeTransaction: string;

  @IsNotEmpty()
  @IsNumber()
  amount_transaction: number;

  @IsNotEmpty()
  type_money_transaction: string;

  @IsNotEmpty()
  @IsDateString()
  date_transaction: string;

  @IsNotEmpty()
  @IsDateString()
  hour_transaction: string;

  @IsNotEmpty()
  @IsNumber()
  price_transaction: number;

  @IsNotEmpty()
  @IsNumber()
  user_id_fk: number;
}
