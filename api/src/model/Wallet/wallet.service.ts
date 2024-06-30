import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
  ) {}

  async createWallet(createWalletDto: CreateWalletDto): Promise<Wallet> {
    const wallet = this.walletRepository.create(createWalletDto);
    return this.walletRepository.save(wallet);
  }

  async getWalletById(id: number): Promise<Wallet> {
    const wallet = await this.walletRepository.findOneBy({ id_wallet: id });
    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    return wallet;
  }

  async getAllWallets(): Promise<Wallet[]> {
    return this.walletRepository.find();
  }

  async updateWallet(id: number, updateWalletDto: UpdateWalletDto): Promise<Wallet> {
    await this.walletRepository.update(id, updateWalletDto);
    const updatedWallet = await this.walletRepository.findOneBy({ id_wallet: id });
    if (!updatedWallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
    return updatedWallet;
  }

  async deleteWallet(id: number): Promise<void> {
    const result = await this.walletRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }
  }
}
