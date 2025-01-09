// src/services/type.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Type } from './type.entity';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';

@Injectable()
export class TypeService {
  constructor(
    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>,
  ) {}

  async create(createTypeDto: CreateTypeDto): Promise<Type> {
    const type = this.typeRepository.create(createTypeDto);
    return this.typeRepository.save(type);
  }

  async findAll(): Promise<Type[]> {
    return this.typeRepository.find({ relations: ['products'] });
  }

  async findOne(id: number): Promise<Type> {
    const type = await this.typeRepository.findOne({
      where: { id_type: id },
      relations: ['products'],
    });
    if (!type) {
      throw new NotFoundException(`Type with ID ${id} not found`);
    }
    return type;
  }

  async update(id: number, updateTypeDto: UpdateTypeDto): Promise<Type> {
    const type = await this.findOne(id);
    Object.assign(type, updateTypeDto);
    return this.typeRepository.save(type);
  }

  async remove(id: number): Promise<void> {
    const type = await this.findOne(id);
    await this.typeRepository.remove(type);
  }
}
