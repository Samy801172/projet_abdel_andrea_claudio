import { Body, Controller, Delete, Get, Param, Post, Put, ValidationPipe, NotFoundException, UseGuards } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtGuard } from '@feature/security';

@ApiTags('subscription')
@Controller('subscription')
@UseGuards(JwtGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'The subscription has been successfully created.', type: Subscription })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async create(@Body(ValidationPipe) createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    return this.subscriptionService.create(createSubscriptionDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Return all subscriptions.', type: [Subscription] })
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'The subscription has been successfully retrieved.', type: Subscription })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  async findOne(@Param('id') id: number): Promise<Subscription> {
    const subscription = await this.subscriptionService.findOne(id);
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }
    return subscription;
  }

  @Put(':id')
  @ApiResponse({ status: 200, description: 'The subscription has been successfully updated.', type: Subscription })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  async update(@Param('id') id: number, @Body() subscription: Partial<Subscription>): Promise<Subscription> {
    return this.subscriptionService.update(id, subscription);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'The subscription has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Subscription not found.' })
  async delete(@Param('id') id: number): Promise<void> {
    await this.subscriptionService.delete(id);
  }
}
