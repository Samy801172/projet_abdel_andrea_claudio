// wallet/wallet.controller.ts
import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  async create(@Body() wallet: Wallet): Promise<Wallet> {
    return this.walletService.create(wallet);
  }

  @Get()
  async findAll(): Promise<Wallet[]> {
    return this.walletService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Wallet> {
    return this.walletService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: number, @Body() wallet: Partial<Wallet>): Promise<Wallet> {
    return this.walletService.update(id, wallet);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.walletService.delete(id);
  }
}
