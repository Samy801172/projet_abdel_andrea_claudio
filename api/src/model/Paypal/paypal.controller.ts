// paypal.controller.ts
import { Controller, Post, Body, Param } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrderService } from '../Order/order.service';
import { CreateOrderDto } from '../Payment/dto/payment.dto';

@ApiTags('paypal')
@Controller('paypal')
export class PaypalController {
  constructor(
    private paypalService: PaypalService,
    private orderService: OrderService
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une commande PayPal' })
  @ApiBody({ type: CreateOrderDto })
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    const order = await this.orderService.getOrderById(createOrderDto.orderId);
    return this.paypalService.createOrder(
      createOrderDto.amount,
      order.id_order.toString()
    );
  }

  @Post('capture/:orderId')
  async capturePayment(@Param('orderId') orderId: string) {
    return this.paypalService.capturePayment(orderId);
  }
}