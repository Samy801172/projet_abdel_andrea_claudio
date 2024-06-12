import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cryptomoney } from './cryptomoney.entity';
import { CryptomoneyService } from './cryptomoney.service';
import { CryptomoneyController } from './cryptomoney.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Cryptomoney])],
  providers: [CryptomoneyService],
  controllers: [CryptomoneyController],
})
export class CryptomoneyModule {}
