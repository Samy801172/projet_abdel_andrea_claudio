import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';

@Injectable()
export class SubscriptionService {
  delete(id: number): void | PromiseLike<void> {
      throw new Error('Method not implemented.');
  }
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async findOne(id: number): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({ where: { id_subscription: id } });
    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }
    return subscription;
  }

  async create(subscription: Subscription): Promise<Subscription> {
    return await this.subscriptionRepository.save(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return await this.subscriptionRepository.find();
  }

  async update(id: number, subscription: Subscription): Promise<void> {
    await this.subscriptionRepository.update(id, subscription);
  }

  async remove(id: number): Promise<void> {
    await this.subscriptionRepository.delete(id);
  }
}


