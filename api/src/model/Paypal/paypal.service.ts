// src/model/Paypal/paypal.service.ts
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import axios from 'axios';
import { Order } from 'model/Order/order.entity';
import { Payment } from 'model/Payment/payment.entity';
import {
  PaymentMethodEnum,
  PaymentStatusEnum,
} from 'model/Payment/dto/create-payment.dto';
import { Product } from '../Product/product.entity';

@Injectable()
export class PaypalService {
  private readonly paypalUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  constructor(
    @Inject(ConfigService)
    private configService: ConfigService,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {
    this.paypalUrl = this.configService.get<string>('PAYPAL_API_URL');
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
  }

  async getAccessToken() {
    try {
      const auth = Buffer.from(
        `${this.clientId}:${this.clientSecret}`,
      ).toString('base64');
      const response = await axios.post(
        `${this.paypalUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data.access_token;
    } catch (error) {
      throw new HttpException(
        'PayPal authentication error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createOrder(amount: number, orderId: number) {
    try {
      console.log('Creating order with:', { amount, orderId }); // Ajoutez ce log
      const accessToken = await this.getAccessToken();
      const order = await this.orderRepository.findOne({
        where: { id_order: orderId },
      });

      if (!order) {
        throw new HttpException(`Order not found`, HttpStatus.NOT_FOUND);
      }

      const response = await axios.post(
        `${this.paypalUrl}/v2/checkout/orders`,
        {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'EUR',
                value: amount.toFixed(2),
              },
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const payment = this.paymentRepository.create({
        order,
        paymentMethod: PaymentMethodEnum.PAYPAL,
        amount,
        paymentStatus: PaymentStatusEnum.PENDING,
        paypalOrderId: response.data.id,
      });

      await this.paymentRepository.save(payment);
      return response.data;
    } catch (error) {
      console.error('Detailed error:', error.response?.data || error); // Log plus détaillé
      throw error;
    }
  }

  async capturePayment(orderId: string) {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.post(
        `${this.paypalUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const payment = await this.paymentRepository.findOne({
        where: { paypalOrderId: orderId },
        relations: [
          'order',
          'order.orderDetails',
          'order.orderDetails.product',
        ],
      });

      if (payment) {
        payment.paymentStatus = PaymentStatusEnum.COMPLETED;
        payment.order.id_statut = 2;

        // Mettre à jour le stock
        for (const detail of payment.order.orderDetails) {
          detail.product.stock -= detail.quantity;
          await this.productRepository.save(detail.product);
        }

        await this.paymentRepository.save(payment);
        await this.orderRepository.save(payment.order);
      }

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Error capturing payment',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
