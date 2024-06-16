import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':id')
  @ApiResponse({ status: 200, description: 'The wallet has been successfully retrieved.', type: Wallet })
  @ApiResponse({ status: 404, description: 'Wallet not found.' })
  async getWalletById(@Param('id') id: number): Promise<Wallet> {
    return this.walletService.getWalletById(id);
  }

  @Post()
  @ApiResponse({ status: 201, description: 'The wallet has been successfully created.', type: Wallet })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async createWallet(@Body() createWalletDto: CreateWalletDto): Promise<Wallet> {
    return this.walletService.createWallet(createWalletDto);
  }
}
