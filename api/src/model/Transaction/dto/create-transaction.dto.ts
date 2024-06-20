import { IsNotEmpty, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @IsNotEmpty()
  @ApiProperty()
  typeTransaction: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  amount_transaction: number;

  @IsNotEmpty()
  @ApiProperty()
  type_money_transaction: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
  date_transaction: string;

  @IsNotEmpty()
  @IsDateString()
  @ApiProperty()
  hour_transaction: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  price_transaction: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  user_id_fk: number;
}
