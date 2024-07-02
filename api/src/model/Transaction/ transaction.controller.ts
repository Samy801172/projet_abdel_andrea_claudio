import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TransactionService } from './transaction.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './transaction.entity';
import { JwtGuard } from '@feature/security';

@ApiTags('transaction')
@Controller('transaction')
@ApiBearerAuth('access-token')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'The transaction has been successfully created.', type: Transaction })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(@Body() createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    return this.transactionService.create(createTransactionDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Return all transactions.', type: [Transaction] })
  async findAll(@Query() query: any): Promise<Transaction[]> {
    return this.transactionService.findAll(query);
  }cd

  @Get(':id')
  @ApiResponse({ status: 200, description: 'The transaction has been successfully retrieved.', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  async findOne(@Param('id') id: number): Promise<Transaction> {
    return this.transactionService.findOne(id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'The transaction has been successfully updated.', type: Transaction })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  async update(@Param('id') id: number, @Body() updateTransactionDto: UpdateTransactionDto): Promise<Transaction> {
    return this.transactionService.update(id, updateTransactionDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'The transaction has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Transaction not found.' })
  async delete(@Param('id') id: number): Promise<void> {
    return this.transactionService.delete(id);
  }
}
