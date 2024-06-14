import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './transaction.entity';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';


@Injectable()
export class TransactionService {
  create(createTransactionDto: CreateTransactionDto): Transaction | PromiseLike<Transaction> {
      throw new Error('Method not implemented.');
  }
  update(id: number, updateTransactionDto: UpdateTransactionDto): Transaction | PromiseLike<Transaction> {
      throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}



  async findAll(query: any): Promise<Transaction[]> {
    const { limit, offset, ...conditions } = query;
    return this.transactionRepository.find({ where: conditions, take: limit, skip: offset });
  }

  async findOne(id: number): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne({ where: { id_transaction: id } });
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
    return transaction;
  }


  async delete(id: number): Promise<void> {
    const result = await this.transactionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }
  }
}
