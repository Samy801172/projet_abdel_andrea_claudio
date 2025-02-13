// src/model/Payment/payment.service.ts
import { HttpException, HttpStatus, Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './payment.entity';
import { CreatePaymentDto, PaymentMethodEnum, PaymentStatusEnum } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { Order } from '../Order/order.entity';
import { PaypalService } from 'model/Paypal/paypal.service';
import { OrderStatus } from 'model/OrderStatus/dto/order-status.enum';
import { OrderStatusEntity } from 'model/OrderStatus/orderStatus.entity';
import { DepositPaymentDto } from './dto/deposit-payment.dto';
import { ManufacturingStatus } from '../Manufacturing/enums/manufacturing-status.enum';
import { CreateDepositOrderDto } from './dto/create-deposit-order.dto';
import { ManufacturingCustomRequest } from '../Manufacturing/manufacturing-custom-request.entity';
import { Logger } from '@nestjs/common';

interface PaymentCreationDto {
  amount: number;
  clientId: number;
  manufacturingRequestId?: number;
  orderId?: number;
  paymentMethod: PaymentMethodEnum;
  paymentStatus: PaymentStatusEnum;
  paypalOrderId: string;
}

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderStatusEntity)
    private readonly orderStatusRepository: Repository<OrderStatusEntity>,
    private readonly paypalService: PaypalService,
    @InjectRepository(ManufacturingCustomRequest)
    private readonly manufacturingCustomRequestRepository: Repository<ManufacturingCustomRequest>
  ) {}

  async createOrder(amount: number, orderId: number): Promise<Payment> {
    const order = await this.orderRepository.findOne({
      where: { id_order: orderId },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    const paypalOrder = await this.paypalService.createOrder(
      amount,
      orderId.toString()
    );

    const payment = new Payment();
    payment.amount = amount;
    payment.paymentMethod = PaymentMethodEnum.PAYPAL;
    payment.paymentStatus = PaymentStatusEnum.PENDING;
    payment.order = order;
    payment.paypalOrderId = paypalOrder.id;

    return this.paymentRepository.save(payment);
  }

  async updatePaymentStatus(paypalOrderId: string, status: PaymentStatusEnum): Promise<Payment> {
    console.log('Mise à jour du statut du paiement:', { paypalOrderId, status });
    
    const payment = await this.findByPaypalOrderId(paypalOrderId);
    if (!payment) {
      console.error('Paiement non trouvé pour paypalOrderId:', paypalOrderId);
      throw new NotFoundException('Paiement non trouvé');
    }

    payment.paymentStatus = status;
    const savedPayment = await this.paymentRepository.save(payment);
    console.log('Paiement mis à jour:', savedPayment);
    
    return savedPayment;
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentRepository.find({
      relations: ['order']
    });
  }

  async findOne(id: number): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: id },
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

  async createDepositPayment(depositPaymentDto: DepositPaymentDto): Promise<Payment> {
    const { manufacturingRequestId, amount, depositPercentage } = depositPaymentDto;
    
    const depositAmount = (amount * depositPercentage) / 100;

    const payment = new Payment();
    payment.amount = depositAmount;
    payment.currency = 'EUR';
    payment.paymentMethod = PaymentMethodEnum.PAYPAL;
    payment.paymentStatus = PaymentStatusEnum.PENDING;
    payment.isDeposit = true;
    payment.manufacturingRequestId = manufacturingRequestId;

    const paypalOrder = await this.paypalService.createOrder(
      depositAmount,
      manufacturingRequestId.toString()
    );

    payment.paypalOrderId = paypalOrder.id;
    
    return this.paymentRepository.save(payment);
  }

  async confirmDepositPayment(paypalOrderId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { paypalOrderId },
      relations: ['manufacturingRequest']
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    // Capture le paiement PayPal
    await this.paypalService.capturePayment(paypalOrderId);

    // Met à jour le statut
    payment.paymentStatus = PaymentStatusEnum.COMPLETED;
    
    // Met à jour le statut de fabrication
    if (payment.manufacturingRequest) {
      payment.manufacturingRequest.status = ManufacturingStatus.EN_FABRICATION;
    }

    return this.paymentRepository.save(payment);
  }

  async createDepositOrder(data: CreateDepositOrderDto) {
    const payment = new Payment();
    payment.amount = data.amount;
    payment.paymentMethod = PaymentMethodEnum.PAYPAL;
    payment.paymentStatus = PaymentStatusEnum.PENDING;
    payment.isDeposit = true;
    payment.manufacturingRequestId = data.manufacturingRequestId;

    return this.paymentRepository.save(payment);
  }

  async createPayment(data: CreatePaymentDto): Promise<Payment> {
    console.log('Création d\'un nouveau paiement:', data);
    
    const payment = new Payment();
    payment.amount = data.amount;
    payment.paymentMethod = data.paymentMethod;
    payment.paymentStatus = data.paymentStatus;
    payment.paypalOrderId = data.paypalOrderId;
    payment.isDeposit = data.isDeposit;
    payment.manufacturingRequestId = data.manufacturingRequestId;

    if (data.orderId) {
      const order = await this.orderRepository.findOne({
        where: { id_order: data.orderId }
      });
      if (order) {
        payment.order = order;
      }
    }

    const savedPayment = await this.paymentRepository.save(payment);
    console.log('Paiement créé:', savedPayment);
    
    return savedPayment;
  }

  async findByPaypalOrderId(paypalOrderId: string): Promise<Payment | null> {
    console.log('Recherche du paiement avec paypalOrderId:', paypalOrderId);
    
    const payment = await this.paymentRepository.findOne({
      where: { paypalOrderId },
      relations: ['order']
    });

    console.log('Paiement trouvé:', payment);
    return payment;
  }

  async updatePayment(paymentId: number, data: any): Promise<Payment> {
    try {
      const payment = await this.paymentRepository.findOne({
        where: { id: paymentId }
      });

      if (!payment) {
        throw new NotFoundException(`Payment ${paymentId} not found`);
      }

      // Vérifier si la fabrication existe avant de mettre à jour
      if (data.manufacturingRequestId) {
        const manufacturing = await this.manufacturingCustomRequestRepository.findOne({
          where: { id: data.manufacturingRequestId }
        });

        if (!manufacturing) {
          throw new NotFoundException(`Manufacturing request ${data.manufacturingRequestId} not found`);
        }
      }

      // Mise à jour du paiement
      Object.assign(payment, data);
      return await this.paymentRepository.save(payment);
    } catch (error) {
      this.logger.error('Error updating payment:', error);
      throw new InternalServerErrorException(
        `Error updating payment: ${error.message}`
      );
    }
  }
}