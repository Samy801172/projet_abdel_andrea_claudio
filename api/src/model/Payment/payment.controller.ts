// src/model/Payment/payment.controller.ts
import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { PaypalService } from '../Paypal/paypal.service';
import { OrderService } from '../Order/order.service';

import { PaymentStatusEnum } from './dto/create-payment.dto';
import { PaypalOrderDto } from 'model/Paypal/dto/paypalOrder.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly paypalService: PaypalService,
    private readonly orderService: OrderService,
  ) {}

  @Post('paypal/create')
  @ApiOperation({ summary: 'Créer un ordre PayPal' })
  @Post('paypal/create')
  async createPaypalOrder(@Body() data: { amount: number; clientId: number }) {
    try {
      const order = await this.orderService.createOrderFromCart(data.clientId);
      return await this.paypalService.createOrder(data.amount, order.id_order);
    } catch (error) {
      console.error('PayPal create order error:', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Post('paypal/capture/:orderId')
  @ApiOperation({ summary: 'Capturer un paiement PayPal' })
  async capturePayment(@Param('orderId') orderId: string) {
    try {
      const result = await this.paypalService.capturePayment(orderId);
      console.log('Capture result:', result);
      return result;
    } catch (error) {
      console.error('Capture error:', error);
      throw new HttpException(
        'Erreur lors de la capture',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Put('paypal/status/:orderId')
  @ApiOperation({ summary: "Mettre à jour le statut d'un paiement" })
  async updatePaymentStatus(
    @Param('orderId') orderId: string,
    @Body('status') status: PaymentStatusEnum,
  ) {
    try {
      return await this.paymentService.updatePaymentStatus(orderId, status);
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la mise à jour du statut',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
