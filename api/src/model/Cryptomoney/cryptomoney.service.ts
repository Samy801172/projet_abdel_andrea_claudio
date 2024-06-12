import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cryptomoney } from './cryptomoney.entity';

@Injectable()
export class CryptomoneyService {
  constructor(
    @InjectRepository(Cryptomoney)
    private cryptomoneyRepository: Repository<Cryptomoney>,
  ) {}

 ypto
}
