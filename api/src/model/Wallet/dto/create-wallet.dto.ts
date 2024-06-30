import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWalletDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type_wallet: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  balance_wallet: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  id_user_fk: number;
}
