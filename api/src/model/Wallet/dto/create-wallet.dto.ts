import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWalletDto {
  @IsNotEmpty()
  type_wallet: string;

  @IsNotEmpty()
  @IsNumber()
  balance_wallet: number;

  @IsNotEmpty()
  @IsNumber()
  id_user_fk: number;
}
