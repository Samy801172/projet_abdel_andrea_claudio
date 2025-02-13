import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Param, Inject, forwardRef } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtGuard } from '@feature/security/guard/jwt.guard';
import { PaypalService } from '../Paypal/paypal.service';
import { ManufacturingService } from './manufacturing.service';
import { PaymentService } from '../Payment/payment.service';
import { PaymentMethodEnum, PaymentStatusEnum } from '../Payment/dto/create-payment.dto';
import { CreatePaymentDto } from '../Payment/dto/create-payment.dto';
import { ManufacturingStatus } from './enums/manufacturing-status.enum';

@ApiTags('manufacturing-payments')
@Controller('manufacturing/payments')
@UseGuards(JwtGuard)
export class ManufacturingPaymentController {
  constructor(
    private readonly manufacturingService: ManufacturingService,
    private readonly paypalService: PaypalService,
    @Inject(forwardRef(() => PaymentService))
    private readonly paymentService: PaymentService
  ) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Créer un ordre de paiement pour un acompte de fabrication' })
  async createDeposit(
    @Body() body: {
      manufacturingId: number;
      clientId: number;
    }
  ) {
    try {
      const manufacturing = await this.manufacturingService.findOne(body.manufacturingId);
      const depositAmount = this.manufacturingService.calculateDepositAmount(manufacturing.estimatedPrice);

      const paypalOrder = await this.paypalService.createOrder(
        depositAmount,
        `MFG_${manufacturing.id}_${Date.now()}`
      );

      const paymentData: CreatePaymentDto = {
        amount: depositAmount,
        clientId: body.clientId,
        manufacturingRequestId: manufacturing.id,
        paymentMethod: PaymentMethodEnum.PAYPAL,
        paymentStatus: PaymentStatusEnum.PENDING,
        paypalOrderId: paypalOrder.id,
        isDeposit: true
      };

      await this.paymentService.createPayment(paymentData);

      return {
        paypalOrderId: paypalOrder.id,
        amount: depositAmount,
        status: 'success'
      };
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la création du paiement d\'acompte',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('deposit/capture/:paypalOrderId')
  @ApiOperation({ summary: 'Capturer un paiement d\'acompte' })
  async captureDeposit(@Param('paypalOrderId') paypalOrderId: string) {
    try {
      const captureResult = await this.paypalService.captureOrder(paypalOrderId);
      const payment = await this.paymentService.findByPaypalOrderId(paypalOrderId);

      if (payment && payment.manufacturingRequestId) {
        await this.manufacturingService.updateStatus(
          payment.manufacturingRequestId,
          ManufacturingStatus.ACOMPTE_PAYE
        );

        await this.paymentService.updatePayment(payment.id, {
          paymentStatus: PaymentStatusEnum.COMPLETED
        });
      }

      return {
        ...captureResult,
        status: 'success'
      };
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la capture du paiement',
        HttpStatus.BAD_REQUEST
      );
    }
  }
} 