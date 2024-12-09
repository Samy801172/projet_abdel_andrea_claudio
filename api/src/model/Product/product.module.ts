// src/model/Product/product.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from './product.entity';
import { Type,} from '../Type/type.entity';
import { Promotion } from '../Promotion/promotion.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Type, Promotion])
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService]
})
export class ProductModule {}


