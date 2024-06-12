import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subscription } from './subscription.entity';



@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find();
  }

  async findOne(id: number): Promise<Subscription> {
    return this.subscriptionRepository.findOne({ where: { id_subscription: id } });
  }
  async create(subscription: Subscription): Promise<Subscription> {
    return this.subscriptionRepository.save(subscription);
  }

  async update(id: number, subscription: Subscription): Promise<Subscription> {
    await this.subscriptionRepository.update(id, subscription);
    return this.findOne(id);
  }

  async delete(id: number): Promise<void> {
    await this.subscriptionRepository.delete(id);
  }
}
