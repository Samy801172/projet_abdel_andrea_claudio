import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateTransactionDto {
  @IsNotEmpty()
  typeTransaction: string;

  @IsNotEmpty()
  @IsNumber()
  amount_transaction: number;

  @IsNotEmpty()
  type_money_transaction: string;

  @IsNotEmpty()
  date_transaction: Date;

  @IsNotEmpty()
  hour_transaction: Date;

  @IsNotEmpty()
  @IsNumber()
  price_transaction: number;

  @IsNotEmpty()
  @IsNumber()
  user_id_fk: number;
}
