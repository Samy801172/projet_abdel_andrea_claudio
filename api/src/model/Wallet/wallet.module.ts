

import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet])],
  providers: [WalletService],
  exports: [WalletService]
})
export class WalletModule {}