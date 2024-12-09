// src/modules/orderStatus.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderStatusService } from './orderStatus.service';
import { OrderStatusController } from './orderStatus.controller';
import { OrderStatus } from './orderStatus.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderStatus])],
  providers: [OrderStatusService],
  controllers: [OrderStatusController],
})
export class OrderStatusModule {}
