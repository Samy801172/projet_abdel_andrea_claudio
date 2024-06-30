import {IsDateString, IsNotEmpty, IsNumber } from "class-validator";

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

  constructor(
    typeTransaction: string = '',
    amount_transaction: number = 0,
    type_money_transaction: string = '',
    date_transaction: string = '',
    hour_transaction: string = '',
    price_transaction: number = 0,
    user_id_fk: number = 0
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
