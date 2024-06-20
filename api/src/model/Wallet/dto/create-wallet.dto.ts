import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWalletDto {
  @IsNotEmpty()
  @ApiProperty()
  type_wallet: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  balance_wallet: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty()
  id_user_fk: number;
}
