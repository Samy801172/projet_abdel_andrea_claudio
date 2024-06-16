import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';
import { CreateTransactionDto } from 'model/Transaction/dto/create-transaction.dto';
import { Transaction } from 'model/Transaction/transaction.entity';
import { UpdateTransactionDto } from 'model/Transaction/dto/update-transaction.dto';

@Injectable()
export class SubscriptionService {
  transactionRepository: any;
  delete(id: number): void | PromiseLike<void> {
      throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async findOne(id: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id_subscription: id } });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const newTransaction = this.transactionRepository.create(createTransactionDto);
    return this.transactionRepository.save(newTransaction);
  }

  async findAll(): Promise<Subscription[]> {
    return await this.subscriptionRepository.find();
  }

  async update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    const transaction = await this.transactionRepository.findOne(id);
    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    if (updateTransactionDto.typeTransaction) {
      transaction.typeTransaction = updateTransactionDto.typeTransaction;
    }
    if (updateTransactionDto.amount_transaction) {
      transaction.amount_transaction = updateTransactionDto.amount_transaction;
    }


    await this.transactionRepository.save(transaction);
    return transaction;
  }

  async remove(id: number): Promise<void> {
    await this.subscriptionRepository.delete(id);
  }
}


