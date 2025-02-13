// src/model/Stock/stock.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';
import { StockAlert } from './stock.entity';
import { ProductService } from '../Product/product.service';
import { Product } from '../Product/product.entity';
import { Type } from '../Type/type.entity';          // Ajouté
import { Promotion } from '../Promotion/promotion.entity'; // Ajouté
import { TypeModule } from '../Type/type.module';    // Ajouté
import { PromotionModule } from '../Promotion/promotion.module'; // Ajouté

@Module({
  imports: [
    TypeOrmModule.forFeature([StockAlert, Product, Type, Promotion]),
    TypeModule,             // Ajouté
    PromotionModule        // Ajouté
  ],
  controllers: [StockController],
  providers: [StockService, ProductService],
  exports: [StockService]
})
export class StockModule {}