// src/model/Payment/payment.service.ts
import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto, PaymentMethodEnum, PaymentStatusEnum } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Order } from '../Order/order.entity';
import { PaypalService } from 'model/Paypal/paypal.service';
import { OrderStatus } from 'model/OrderStatus/dto/order-status.enum';
import { OrderStatusEntity } from 'model/OrderStatus/orderStatus.entity';


@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderStatusEntity)
    private readonly orderStatusRepository: Repository<OrderStatusEntity>,
    private readonly paypalService: PaypalService
  ) {}

  async createOrder(amount: number, orderId: number): Promise<Payment> {
    const order = await this.orderRepository.findOne({
      where: { id_order: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const paypalOrder = await this.paypalService.createOrder(amount, orderId);

    const payment = new Payment();
    payment.amount = amount;
    payment.paymentMethod = PaymentMethodEnum.PAYPAL;
    payment.paymentStatus = PaymentStatusEnum.PENDING;
    payment.order = order;
    payment.paypalOrderId = paypalOrder.id;

    return this.paymentRepository.save(payment);
  }

  async updatePaymentStatus(orderId: string, status: PaymentStatusEnum) {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { paypalOrderId: orderId },
        relations: ['order']
      });

      if (!payment) throw new NotFoundException();

      payment.paymentStatus = status;
      payment.order.id_statut = 5; // Statut PAID

      await this.paymentRepository.save(payment);
      await this.orderRepository.save(payment.order);

      return payment;
    } catch (error) {
      throw new HttpException('Error updating status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
  async capturePayment(orderId: string): Promise<any> {
    // Ajoutez votre logique ici pour capturer le paiement
    // Exemple : appeler une API externe ou effectuer une opération dans la base de données
    return { success: true, orderId };
  }


}