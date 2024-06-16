import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    const wallet = this.walletRepository.create(createWalletDto);
    return this.walletRepository.save(wallet);
  }

  async getWalletById(id: number): Promise<Wallet> {
    return this.walletRepository.findOne({ where: { id_wallet: id } });
  }

  async getAllWallets(): Promise<Wallet[]> {
    return this.walletRepository.find();
  }
}
