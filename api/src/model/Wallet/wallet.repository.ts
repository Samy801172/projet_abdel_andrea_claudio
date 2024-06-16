import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './wallet.entity';

@Injectable()
export class WalletRepository {
  constructor(
    @InjectRepository(Wallet)
    private readonly repository: Repository<Wallet>,
  ) {}

  async findOne(id: number): Promise<Wallet> {
    return this.repository.findOne({ where: { id_wallet: id } });
  }

  async findAll(): Promise<Wallet[]> {
    return this.repository.find();
  }
}
