// src/model/Cryptocurrency/dto/create-cryptocurrency.dto.ts

import {ApiProperty} from '@nestjs/swagger';

export class CreateCryptocurrencyDto {
  @ApiProperty()
  name_crypto: string;
  @ApiProperty()
  value_crypto: number;
}