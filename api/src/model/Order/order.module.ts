// src/model/Order/order.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './order.entity';
import { Client } from '../Client/client.entity'; // Importer l'entité Client
import { OrderDetail } from './OrderDetail/order-detail.entity';
import { Product } from 'model/Product/product.entity';
import { Cart } from 'model/Cart/cart.entity';
import { ProductPromotion } from 'model/ProductPromotion/productPromotion.entity';
import { OrderStatus } from 'model/OrderStatus/dto/order-status.enum';
import { OrderStatusEntity } from 'model/OrderStatus/orderStatus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderDetail,
      Client,
      OrderStatusEntity,
      Product,
      Cart,
      ProductPromotion,
    ]),
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
