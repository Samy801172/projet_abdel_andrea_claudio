import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './transaction.entity';

@Controller('transaction')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionService.create(createTransactionDto);
  }

  @Get()
  async findAll(@Query() query: any): Promise<Transaction[]> {
    return this.transactionService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Transaction> {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: number, @Body() updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.transactionService.delete(id);
  }
}
