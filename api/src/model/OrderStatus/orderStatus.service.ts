// src/model/OrderStatus/orderStatus.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatusEntity } from './orderStatus.entity';
import { CreateOrderStatusDto } from './dto/create-orderStatus.dto';
import { UpdateOrderStatusDto } from './dto/update-orderStatus.dto';

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectRepository(OrderStatusEntity)
    private orderStatusRepository: Repository<OrderStatusEntity>
  ) {}

  async create(createOrderStatusDto: CreateOrderStatusDto): Promise<OrderStatusEntity> {
    const orderStatus = this.orderStatusRepository.create(createOrderStatusDto);
    return this.orderStatusRepository.save(orderStatus);
  }

  async findAll(): Promise<OrderStatusEntity[]> {
    return this.orderStatusRepository.find({ relations: ['orders'] });
  }

  async findOne(id: number): Promise<OrderStatusEntity> {
    return this.orderStatusRepository.findOne({
      where: { statusId: id },
      relations: ['orders']
    });
  }

  async update(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderStatusEntity> {
    const orderStatus = await this.findOne(id);
    if (!orderStatus) {
      throw new NotFoundException(`Status with ID ${id} not found`);
    }

    const updated = Object.assign(orderStatus, updateOrderStatusDto);
    return this.orderStatusRepository.save(updated);
  }

  async remove(id: number): Promise<void> {
    const orderStatus = await this.findOne(id);
    await this.orderStatusRepository.remove(orderStatus);
  }
}
