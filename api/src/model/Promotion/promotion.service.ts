// src/model/Promotion/promotion.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Promotion } from './promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>
  ) {}

  async create(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const promotion = this.promotionRepository.create(createPromotionDto);
    return await this.promotionRepository.save(promotion);
  }

  async findAll(): Promise<Promotion[]> {
    return await this.promotionRepository.find();
  }

  async findOne(id: number): Promise<Promotion> {
    const promotion = await this.promotionRepository.findOne({
      where: { id_promotion: id }  // Utilisation de id_promotion au lieu de id
    });

    if (!promotion) {
      throw new NotFoundException(`Promotion #${id} non trouvée`);
    }

    return promotion;
  }

  async update(id: number, updatePromotionDto: CreatePromotionDto): Promise<Promotion> {
    const promotion = await this.findOne(id);

    // Mise à jour des propriétés
    Object.assign(promotion, {
      ...updatePromotionDto,
      startDate: new Date(updatePromotionDto.startDate),
      endDate: new Date(updatePromotionDto.endDate)
    });

    return await this.promotionRepository.save(promotion);
  }

  async remove(id: number): Promise<void> {
    const promotion = await this.findOne(id);
    await this.promotionRepository.remove(promotion);
  }


  async getActivePromotions(): Promise<Promotion[]> {
    const now = new Date();
    console.log('Recherche des promotions actives à la date:', now);

    const promotions = await this.promotionRepository
      .createQueryBuilder('promotion')
      .where('promotion.startDate <= :now', { now })
      .andWhere('promotion.endDate >= :now', { now })
      .getMany();

    console.log('Promotions trouvées:', promotions);
    return promotions;
  }

  async createPromotion(createPromotionDto: CreatePromotionDto): Promise<Promotion> {
    const promotion = this.promotionRepository.create({
      description: createPromotionDto.description,
      startDate: new Date(createPromotionDto.startDate),
      endDate: new Date(createPromotionDto.endDate),
      discountPercentage: createPromotionDto.discountPercentage
    });

    return await this.promotionRepository.save(promotion);
  }

}