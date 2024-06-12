// wallet/wallet.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
  ) {}

  async create(wallet: Wallet): Promise<Wallet> {
    return this.walletRepository.save(wallet);
  }

  async findAll(): Promise<Wallet[]> {
    return this.walletRepository.find();
  }

  async findOne(id: number): Promise<Wallet> {
    return this.walletRepository.findOne({ where: { id_wallet: id } });
  }

  async update(id_wallet: number, wallet: Partial<Wallet>): Promise<Wallet> {
    await this.walletRepository.update(id_wallet, wallet);
    return this.findOne(id_wallet);
  }

  async delete(id: number): Promise<void> {
    await this.walletRepository.delete(id);
  }
}
