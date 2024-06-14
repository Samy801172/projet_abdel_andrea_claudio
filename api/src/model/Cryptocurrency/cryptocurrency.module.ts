// src/model/Cryptocurrency/cryptocurrency.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cryptocurrency } from './cryptocurrency.entity';
import { CryptocurrencyService } from './cryptocurrency.service';
import { CryptocurrencyController } from './cryptocurrency.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cryptocurrency])],
  providers: [CryptocurrencyService],
  controllers: [CryptocurrencyController],
})
export class CryptocurrencyModule {}
