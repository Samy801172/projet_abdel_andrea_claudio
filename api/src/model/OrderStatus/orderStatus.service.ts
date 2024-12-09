// src/services/orderStatus.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from './orderStatus.entity';
import { CreateOrderStatusDto } from './dto/create-orderStatus.dto';
import { UpdateOrderStatusDto } from './dto/update-orderStatus.dto';


@Injectable()
export class OrderStatusService {
  constructor(
    @InjectRepository(OrderStatus)
    private readonly orderStatusRepository: Repository<OrderStatus>,
  ) {}

  async create(createOrderStatusDto: CreateOrderStatusDto): Promise<OrderStatus> {
    const orderStatus = this.orderStatusRepository.create(createOrderStatusDto);
    return this.orderStatusRepository.save(orderStatus);
  }

  async findAll(): Promise<OrderStatus[]> {
    return this.orderStatusRepository.find({ relations: ['orders'] });
  }

  async findOne(id: number): Promise<OrderStatus> {
    const orderStatus = await this.orderStatusRepository.findOne({
      where: { statusId: id },
      relations: ['orders'],
    });
    if (!orderStatus) {
      throw new NotFoundException(`OrderStatus with ID ${id} not found`);
    }
    return orderStatus;
  }

  async update(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderStatus> {
    const orderStatus = await this.findOne(id);
    Object.assign(orderStatus, updateOrderStatusDto);
    return this.orderStatusRepository.save(orderStatus);
  }

  async remove(id: number): Promise<void> {
    const orderStatus = await this.findOne(id);
    await this.orderStatusRepository.remove(orderStatus);
  }
}
