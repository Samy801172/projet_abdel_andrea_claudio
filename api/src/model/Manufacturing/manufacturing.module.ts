import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Manufacturing } from './manufacturing.entity';
import { ManufacturingController } from './manufacturing.controller';
import { ManufacturingService } from './manufacturing.service';
import { Order } from '../Order/order.entity';
import { OrderStatusEntity } from '../OrderStatus/orderStatus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Manufacturing,
      Order,
      OrderStatusEntity
    ])
  ],
  controllers: [ManufacturingController],
  providers: [ManufacturingService],
  exports: [ManufacturingService]
})
export class ManufacturingModule {} 