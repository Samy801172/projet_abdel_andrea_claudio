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
    // Injection du repository TypeORM pour la gestion des types
    @InjectRepository(Type)
    private readonly typeRepository: Repository<Type>,
  ) {}

  // Création d'un nouveau type
  async create(createTypeDto: CreateTypeDto): Promise<Type> {
    const type = this.typeRepository.create(createTypeDto);
    return this.typeRepository.save(type);
  }

  // Récupération de tous les types avec les relations associées aux produits
  async findAll(): Promise<Type[]> {
    return this.typeRepository.find({ relations: ['products'] });
  }

  // Recherche d'un type spécifique par son ID
  async findOne(id: number): Promise<Type> {
    const type = await this.typeRepository.findOne({
      where: { id_type: id },
      relations: ['products'],
    });
    if (!type) {
      throw new NotFoundException(`Type avec l'ID ${id} introuvable`);
    }
    return type;
  }

  // Mise à jour d'un type existant
  async update(id: number, updateTypeDto: UpdateTypeDto): Promise<Type> {
    const type = await this.findOne(id);
    Object.assign(type, updateTypeDto);
    return this.typeRepository.save(type);
  }

  // Suppression d'un type par son ID
  async remove(id: number): Promise<void> {
    const type = await this.findOne(id);
    await this.typeRepository.remove(type);
  }
}