// src/model/Product/product.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from './product.entity';
import { Type } from '../Type/type.entity';
import { Promotion } from '../Promotion/promotion.entity';
import { PromotionModule } from '../Promotion/promotion.module';
import { TypeModule } from '../Type/type.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Type, Promotion]),
    PromotionModule,
    TypeModule
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService]
})
export class ProductModule {}