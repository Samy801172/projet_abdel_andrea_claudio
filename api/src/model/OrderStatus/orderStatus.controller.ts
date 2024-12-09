// src/controllers/orderStatus.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { OrderStatusService } from './orderStatus.service';
import { CreateOrderStatusDto } from './dto/create-orderStatus.dto';
import { UpdateOrderStatusDto } from './dto/update-orderStatus.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('order-status')
@ApiBearerAuth('access-token')
@Controller('order-status')
export class OrderStatusController {
  constructor(private readonly orderStatusService: OrderStatusService) {}

  @Post()
  create(@Body() createOrderStatusDto: CreateOrderStatusDto) {
    return this.orderStatusService.create(createOrderStatusDto);
  }

  @Get()
  findAll() {
    return this.orderStatusService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderStatusService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.orderStatusService.update(+id, updateOrderStatusDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderStatusService.remove(+id);
  }
}
