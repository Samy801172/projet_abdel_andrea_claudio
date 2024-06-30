import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class UpdateWalletDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  type_wallet?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  balance_wallet?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  id_user_fk?: number;
}
