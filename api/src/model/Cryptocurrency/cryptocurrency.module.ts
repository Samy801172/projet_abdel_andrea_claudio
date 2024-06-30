
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cryptocurrency } from './cryptocurrency.entity';
import { CryptocurrencyService } from './cryptocurrency.service';
import { CryptocurrencyController } from './cryptocurrency.controller';
import { SecurityModule } from '@feature/security';

@Module({
  imports: [SecurityModule, TypeOrmModule.forFeature([Cryptocurrency])],
  providers: [CryptocurrencyService],
  controllers: [CryptocurrencyController],
})
export class CryptocurrencyModule {}
