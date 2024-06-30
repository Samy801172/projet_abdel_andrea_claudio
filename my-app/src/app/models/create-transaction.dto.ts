import { IsString, IsNumber, IsDateString } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  typeTransaction: string;

  @IsNumber()
  amount_transaction: number;

  @IsString()
  type_money_transaction: string;

  @IsDateString()
  date_transaction: string;

  @IsString()
  hour_transaction: string;

  @IsNumber()
  price_transaction: number;

  @IsNumber()
  user_id_fk: number;

  constructor(
    typeTransaction: string,
    amount_transaction: number,
    type_money_transaction: string,
    date_transaction: string,
    hour_transaction: string,
    price_transaction: number,
    user_id_fk: number
  ) {
    this.typeTransaction = typeTransaction;
    this.amount_transaction = amount_transaction;
    this.type_money_transaction = type_money_transaction;
    this.date_transaction = date_transaction;
    this.hour_transaction = hour_transaction;
    this.price_transaction = price_transaction;
    this.user_id_fk = user_id_fk;
  }
}
