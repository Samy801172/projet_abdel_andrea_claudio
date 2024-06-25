// src/model/Cryptocurrency/dto/update-cryptocurrency.dto.ts

import {ApiProperty} from '@nestjs/swagger';

export class UpdateCryptocurrencyDto {
  @ApiProperty()
  name_crypto?: string;
  @ApiProperty()
  value_crypto?: number;
}
