// src/entities/subscription.entity.ts
import { User } from '../User/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id_subscription: number;

  @Column()
  name_subscription: string;

  @Column()
  price_subscription: number;

  @Column()
  description_subscription: string;

  @Column()
  duration_subscription_d: number;

  @OneToMany(() => User, user => user.subscription)
  users: User[] | undefined;
}

