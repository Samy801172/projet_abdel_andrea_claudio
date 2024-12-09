// src/model/Payment/payment.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Order } from '../Order/order.entity';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const order = await this.orderRepository.findOne({
      where: { id_order: createPaymentDto.orderId }
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${createPaymentDto.orderId} not found`);
    }

    const payment = this.paymentRepository.create({
      order,
      paymentMethod: createPaymentDto.paymentMethod,
      amount: createPaymentDto.amount,
      paymentStatus: createPaymentDto.paymentStatus
    });

    return this.paymentRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: ['order']
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id_payment: id },
      relations: ['order']
    });

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async update(id: number, updatePaymentDto: UpdatePaymentDto): Promise<Payment> {
    const payment = await this.findOne(id);

    if (updatePaymentDto.orderId) {
      const order = await this.orderRepository.findOne({
        where: { id_order: updatePaymentDto.orderId }
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${updatePaymentDto.orderId} not found`);
      }

      payment.order = order;
    }

    // Mise à jour des autres propriétés
    Object.assign(payment, {
      paymentMethod: updatePaymentDto.paymentMethod ?? payment.paymentMethod,
      amount: updatePaymentDto.amount ?? payment.amount,
      paymentStatus: updatePaymentDto.paymentStatus ?? payment.paymentStatus
    });

    return this.paymentRepository.save(payment);
  }

  async remove(id: number): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentRepository.remove(payment);
  }
}