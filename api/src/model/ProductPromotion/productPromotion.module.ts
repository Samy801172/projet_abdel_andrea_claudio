// src/modules/productPromotion.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductPromotionService } from './productPromotion.service';
import { ProductPromotionController } from './productPromotion.controller';
import { ProductPromotion } from './productPromotion.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([ProductPromotion]),
  ],
  exports: [TypeOrmModule],
})
export class ProductPromotionModule {}
