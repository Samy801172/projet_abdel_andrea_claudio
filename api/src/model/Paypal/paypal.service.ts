// src/model/Paypal/paypal.service.ts
import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import axios from "axios";
import { Order } from "model/Order/order.entity";
import { Payment } from "model/Payment/payment.entity";
import { PaymentMethodEnum, PaymentStatusEnum } from "model/Payment/dto/create-payment.dto";
import { Product } from '../Product/product.entity';
import { HttpService } from "@nestjs/axios";

@Injectable()
export class PaypalService {
  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>
  ) {}

  private readonly paypalUrl = this.configService.get('PAYPAL_API_URL');

  private async getAccessToken(): Promise<string> {
    const clientId = this.configService.get('PAYPAL_CLIENT_ID');
    const clientSecret = this.configService.get('PAYPAL_CLIENT_SECRET');
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await this.httpService.post(
      `${this.paypalUrl}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    ).toPromise();

    return response.data.access_token;
  }

  async createOrder(amount: number, referenceId: string): Promise<any> {
    const accessToken = await this.getAccessToken();
    
    // Utiliser une URL par défaut si FRONTEND_URL n'est pas configuré
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:4200';

    // Convertir EUR en USD pour PayPal Sandbox (taux fixe pour les tests)
    const usdAmount = (amount * 1.1).toFixed(2); // Approximation EUR -> USD

    const response = await this.httpService.post(
      `${this.paypalUrl}/v2/checkout/orders`,
      {
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: referenceId,
          amount: {
            currency_code: 'USD', // USD requis pour Sandbox
            value: usdAmount
          },
          description: `Commande GOHAN-MED (${amount}€)`
        }],
        application_context: {
          brand_name: 'GOHAN-MED',
          landing_page: 'NO_PREFERENCE',
          user_action: 'PAY_NOW',
          shipping_preference: 'NO_SHIPPING',
          return_url: `${frontendUrl}/payment/success`,
          cancel_url: `${frontendUrl}/payment/cancel`
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    ).toPromise();

    return response.data;
  }

  async captureOrder(paypalOrderId: string): Promise<any> {
    const accessToken = await this.getAccessToken();
    
    const response = await this.httpService.post(
      `${this.paypalUrl}/v2/checkout/orders/${paypalOrderId}/capture`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    ).toPromise();

    return response.data;
  }

  async capturePayment(orderId: string) {
    try {
      const accessToken = await this.getAccessToken();
      const response = await axios.post(
        `${this.paypalUrl}/v2/checkout/orders/${orderId}/capture`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const payment = await this.paymentRepository.findOne({
        where: { paypalOrderId: orderId },
        relations: ['order', 'order.orderDetails', 'order.orderDetails.product']
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
      throw new HttpException('Error capturing payment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}