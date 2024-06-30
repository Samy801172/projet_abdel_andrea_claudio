import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOneOptions } from 'typeorm';
import { Subscription } from './subscription.entity';


@Injectable()
export class SubscriptionValidationPipe implements PipeTransform<number, Promise<Subscription>> {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async transform(value: number): Promise<Subscription> {
    const options: FindOneOptions<Subscription> = { where: { id_subscription: value } };
    const subscription = await this.subscriptionRepository.findOne(options);
    if (!subscription) {
      throw new BadRequestException(`Abonnement avec l'ID ${value} non trouvé`);
    }
    return subscription;
  }
}
