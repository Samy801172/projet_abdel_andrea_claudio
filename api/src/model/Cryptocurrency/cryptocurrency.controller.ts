// src/model/Cryptocurrency/cryptocurrency.controller.ts

import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { CryptocurrencyService } from './cryptocurrency.service';
import { Cryptocurrency } from './cryptocurrency.entity';
import { CreateCryptocurrencyDto } from './dto/create-cryptocurrency.dto';
import { UpdateCryptocurrencyDto } from './dto/update-cryptocurrency.dto';

@Controller('cryptocurrency')
export class CryptocurrencyController {
  constructor(private readonly cryptocurrencyService: CryptocurrencyService) {}

  @Post()
  async create(@Body() createCryptocurrencyDto: CreateCryptocurrencyDto): Promise<Cryptocurrency> {
    return this.cryptocurrencyService.create(createCryptocurrencyDto);
  }

  @Get()
  async findAll(): Promise<Cryptocurrency[]> {
    return this.cryptocurrencyService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Cryptocurrency> {
    return this.cryptocurrencyService.findOne(+id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateCryptocurrencyDto: UpdateCryptocurrencyDto): Promise<Cryptocurrency> {
    return this.cryptocurrencyService.update(+id, updateCryptocurrencyDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.cryptocurrencyService.remove(+id);
  }
}

