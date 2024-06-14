// src/model/Cryptocurrency/cryptocurrency.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cryptocurrency } from './cryptocurrency.entity';
import { CreateCryptocurrencyDto } from './dto/create-cryptocurrency.dto';
import { UpdateCryptocurrencyDto } from './dto/update-cryptocurrency.dto';

@Injectable()
export class CryptocurrencyService {
  constructor(
    @InjectRepository(Cryptocurrency)
    private readonly cryptocurrencyRepository: Repository<Cryptocurrency>,
  ) {}

  async create(createCryptocurrencyDto: CreateCryptocurrencyDto): Promise<Cryptocurrency> {
    const cryptocurrency = new Cryptocurrency();
    cryptocurrency.name_crypto = createCryptocurrencyDto.name_crypto;
    cryptocurrency.value_crypto = createCryptocurrencyDto.value_crypto;
    return this.cryptocurrencyRepository.save(cryptocurrency);
  }

  async findAll(): Promise<Cryptocurrency[]> {
    return this.cryptocurrencyRepository.find();
  }

  async findOne(id: number): Promise<Cryptocurrency | null> {
    const cryptocurrency = await this.cryptocurrencyRepository.findOne({ where: { id_crypto: id } });
    if (!cryptocurrency) {
      throw new NotFoundException(`Cryptocurrency with ID ${id} not found`);
    }
    return cryptocurrency;
  }

  async update(id: number, updateCryptocurrencyDto: UpdateCryptocurrencyDto): Promise<Cryptocurrency> {
    const existingCryptocurrency = await this.cryptocurrencyRepository.findOne({ where: { id_crypto: id } });
    if (!existingCryptocurrency) {
      throw new NotFoundException(`Cryptocurrency with ID ${id} not found`);
    }

    existingCryptocurrency.name_crypto = updateCryptocurrencyDto.name_crypto || existingCryptocurrency.name_crypto;
    existingCryptocurrency.value_crypto = updateCryptocurrencyDto.value_crypto || existingCryptocurrency.value_crypto;

    return this.cryptocurrencyRepository.save(existingCryptocurrency);
  }

  async remove(id: number): Promise<void> {
    const cryptocurrency = await this.cryptocurrencyRepository.findOne({ where: { id_crypto: id } });;
    if (!cryptocurrency) {
      throw new NotFoundException(`Cryptocurrency with ID ${id} not found`);
    }
    await this.cryptocurrencyRepository.remove(cryptocurrency);
  }
}
