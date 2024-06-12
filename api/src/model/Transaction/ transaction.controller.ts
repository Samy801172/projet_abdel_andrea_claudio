import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

import { Transaction, Transaction as TransactionEntity } from './transaction.entity';

@Controller('transaction')
export class TransactionController {
  transactionRepository: any;
  constructor(private readonly transactionService: TransactionService) {}

  // Endpoint to create a new transaction
  @Post()
  async create(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = this.transactionRepository.create(createTransactionDto);
    return this.transactionRepository.save(transaction);
  }
  // Endpoint to get all transactions with optional query parameters
  @Get()
  async findAll(query: any): Promise<Transaction[]> {
    const { limit, offset, ...conditions } = query;
    return this.transactionRepository.find({ where: conditions, take: limit, skip: offset });
  }

  // Endpoint to get a single transaction by id
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<TransactionEntity> {
    return this.transactionService.findOne(id);
  }

  // Endpoint to update a transaction by id
  async update(id: number, updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    await this.transactionRepository.update(id, updateTransactionDto);
    return this.transactionRepository.findOne(id);
  }

  // Endpoint to delete a transaction by id
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.transactionService.delete(id);
  }
}
