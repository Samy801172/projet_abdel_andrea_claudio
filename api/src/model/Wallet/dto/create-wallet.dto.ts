
import { ApiProperty } from '@nestjs/swagger';

export class CreateWalletDto {

  @ApiProperty()
  type_wallet: string;


  @ApiProperty()
  balance_wallet: number;


  @ApiProperty()
  id_user_fk: number;
}
