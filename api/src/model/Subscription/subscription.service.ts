import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create(createSubscriptionDto);
    return this.subscriptionRepository.save(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find();
  }

  async findOne(id: number): Promise<Subscription> {
    return this.subscriptionRepository.findOne({ where: { id_subscription: id } });
  }

  async update(id: number, updateSubscriptionDto: Partial<Subscription>): Promise<Subscription> {
    await this.subscriptionRepository.update(id, updateSubscriptionDto);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    const subscription = await this.findOne(id);
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    await this.subscriptionRepository.delete(id);
  }
}
