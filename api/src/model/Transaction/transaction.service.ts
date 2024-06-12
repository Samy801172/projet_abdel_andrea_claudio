import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async create(transaction: Transaction): Promise<Transaction> {
    return this.transactionRepository.save(transaction);
  }

  async findAll(): Promise<Transaction[]> {
    return this.transactionRepository.find();
  }


  async findOne(id: number): Promise<Transaction> {
    return this.transactionRepository.findOne({ where: { id_transaction: id } });
  }

  async update(id: number, transaction: Transaction): Promise<Transaction> {
    await this.transactionRepository.update(id, transaction);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.transactionRepository.delete(id);
  }
}

export class TransactionController {
}