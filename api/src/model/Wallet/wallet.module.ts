

import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';
import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { SecurityService } from '@feature/security/service';
import { SecurityModule } from '@feature/security';


@Module({
  imports: [SecurityModule, TypeOrmModule.forFeature([Wallet])],
  providers: [WalletService],
  exports: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}