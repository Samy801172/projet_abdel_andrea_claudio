import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { Subscription } from './subscription.entity';

@Controller('subscriptions')
export class SubscriptionController {
  subscriptionRepository: any;
  constructor(private readonly subscriptionService: SubscriptionService) {}

// Endpoint to create a new subscription
  @Post()
  async create(@Body() subscription: Subscription): Promise<Subscription> {
    return this.subscriptionService.create(subscription);
  }
// Endpoint to get all subscriptions
  @Get()
  async findAll(): Promise<Subscription[]> {
    return this.subscriptionService.findAll();
  }
  // Endpoint to get a single subscription by id
  @Get(':id')
  async findOne(@Param('id') id: number): Promise<Subscription> {
    return this.subscriptionService.findOne(id);
  }
  // Method to update a subscription by id
  async update(id: number, subscription: Partial<Subscription>): Promise<Subscription> {
    const existingSubscription = await this.subscriptionRepository.findOne(id);
    if (!existingSubscription) {
      // Throw an error if no subscription is found with the given id
      throw new Error(`Subscription with id ${id} not found`);
    }

    // Merge the existing subscription with the new data
    Object.assign(existingSubscription, subscription);

// Save the updated subscription
    return this.subscriptionRepository.save(existingSubscription);
  }
// Endpoint to delete a subscription by id
  @Delete(':id')
  async delete(@Param('id') id: number): Promise<void> {
    return this.subscriptionService.delete(id);
  }
}
