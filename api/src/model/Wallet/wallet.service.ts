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

  async create(createWalletDto: CreateWalletDto): Promise<Wallet> {
    const wallet = this.walletRepository.create(createWalletDto);
    return this.walletRepository.save(wallet);
  }

  async findAll(): Promise<Wallet[]> {
    return this.walletRepository.find();
  }

  async findOne(id: number): Promise<Wallet> {
    return this.walletRepository.findOne({ where: { id_wallet: id } });
  }

  async update(id: number, updateWalletDto: Partial<CreateWalletDto>): Promise<Wallet> {
    await this.walletRepository.update(id, updateWalletDto);
    return this.walletRepository.findOne({ where: { id_wallet: id } });
  }

  async delete(id: number): Promise<void> {
    await this.walletRepository.delete(id);
  }
}
