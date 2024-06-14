import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { ApiCodeResponse, ApiResponse } from '@common/config';



@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createWalletDto: CreateWalletDto): Promise<ApiResponse> {
    try {
      const wallet = await this.walletService.create(createWalletDto);
      return {
        code: ApiCodeResponse.COMMON_SUCCESS,
        data: wallet,
        result: true,
      };
    } catch (error) {
      return {
        code: ApiCodeResponse.SIGNUP_ERROR,
        data: null,
        result: false,
      };
    }
  }

  @Get()
  async findAll(): Promise<ApiResponse> {
    try {
      const wallets = await this.walletService.findAll();
      return {
        code: ApiCodeResponse.COMMON_SUCCESS,
        data: wallets,
        result: true,
      };
    } catch (error) {
      return {
        code: ApiCodeResponse.USER_NOT_FOUND,
        data: null,
        result: false,
      };
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<ApiResponse> {
    try {
      const wallet = await this.walletService.findOne(id);
      if (wallet) {
        return {
          code: ApiCodeResponse.COMMON_SUCCESS,
          data: wallet,
          result: true,
        };
      } else {
        return {
          code: ApiCodeResponse.USER_NOT_FOUND,
          data: null,
          result: false,
        };
      }
    } catch (error) {
      return {
        code: ApiCodeResponse.USER_NOT_FOUND,
        data: null,
        result: false,
      };
    }
  }
}
function AuthGuard(arg0: string): Function | import("@nestjs/common").CanActivate {
    throw new Error('Function not implemented.');
}

