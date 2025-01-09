// paypal.controller.ts
import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { PaypalService } from './paypal.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreatePaypalOrderDto } from './dto/paypal.dto';
import { OrderService } from 'model/Order/order.service';

@ApiTags('paypal')
@Controller('paypal')
export class PaypalController {
  constructor(
    private paypalService: PaypalService,
    private orderService: OrderService,
  ) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Créer une commande PayPal' })
  @ApiBody({ type: CreatePaypalOrderDto })
  async createOrder(@Body() createOrderDto: CreatePaypalOrderDto) {
    const order = await this.orderService.createOrderFromCart(
      createOrderDto.clientId,
    );
    return this.paypalService.createOrder(
      createOrderDto.amount,
      order.id_order,
    );
  }

  @Post('capture/:orderId')
  async capturePayment(@Param('orderId') orderId: string) {
    return this.paypalService.capturePayment(orderId);
  }
}
