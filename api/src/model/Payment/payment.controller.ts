// src/model/Payment/payment.controller.ts
import { Controller, Get, Post, Body, Put, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@ApiTags('payments')
@Controller('api/payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouveau paiement' })
  @ApiResponse({ status: 201, description: 'Le paiement a été créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Données invalides.' })
  @ApiBody({ type: CreatePaymentDto })
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les paiements' })
  @ApiResponse({ status: 200, description: 'Liste des paiements récupérée avec succès.' })
  findAll() {
    return this.paymentService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un paiement par ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du paiement' })
  @ApiResponse({ status: 200, description: 'Paiement trouvé.' })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé.' })
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(+id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un paiement' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du paiement' })
  @ApiBody({ type: UpdatePaymentDto })
  @ApiResponse({ status: 200, description: 'Paiement mis à jour avec succès.' })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé.' })
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un paiement' })
  @ApiParam({ name: 'id', type: 'number', description: 'ID du paiement' })
  @ApiResponse({ status: 200, description: 'Paiement supprimé avec succès.' })
  @ApiResponse({ status: 404, description: 'Paiement non trouvé.' })
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}