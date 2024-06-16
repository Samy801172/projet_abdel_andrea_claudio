// src/entities/subscription.entity.ts
import { User } from '../User/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id_subscription: number;

  @Column()
  name_subscription: string;


  @Column('float')
  price_subscription: number;

  @Column({ type: 'text' })
  description_subscription: string;

  @Column('int')
  duration_subscription_d: number;

  @OneToMany(() => User, user => user.subscription)
  users: User[] | undefined;
}

