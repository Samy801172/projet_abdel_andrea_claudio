import { Controller, UseGuards, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { WalletService } from './wallet.service';
import { Wallet } from './wallet.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { JwtGuard } from '@feature/security';
@ApiBearerAuth('access-token')
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

  @Get()
  @ApiResponse({ status: 200, description: 'Wallets have been successfully retrieved.', type: [Wallet] })
  async getAllWallets(): Promise<Wallet[]> {
    return this.walletService.getAllWallets();
  }

  @Post('create')
  @ApiResponse({ status: 201, description: 'The wallet has been successfully created.', type: Wallet })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(@Body() createWalletDto: CreateWalletDto): Promise<Wallet> {
    try {
      const wallet = await this.walletService.createWallet(createWalletDto);
      return wallet;
    } catch (error) {
      throw new HttpException(`Failed to create wallet: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'The wallet has been successfully updated.', type: Wallet })
  @ApiResponse({ status: 404, description: 'Wallet not found.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async updateWallet(@Param('id') id: number, @Body() updateWalletDto: CreateWalletDto): Promise<Wallet> {
    try {
      const wallet = await this.walletService.updateWallet(id, updateWalletDto);
      return wallet;
    } catch (error) {
      throw new HttpException(`Failed to update wallet: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'The wallet has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Wallet not found.' })
  async deleteWallet(@Param('id') id: number): Promise<void> {
    try {
      await this.walletService.deleteWallet(id);
    } catch (error) {
      throw new HttpException(`Failed to delete wallet: ${error.message}`, HttpStatus.NOT_FOUND);
    }
  }
}
