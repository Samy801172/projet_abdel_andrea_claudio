// src/entities/user.entity.ts
import { Subscription } from 'model/Subscription/subscription.entity';
import { Wallet } from 'model/Wallet/wallet.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from 'typeorm';


@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id_user: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  statut_verif_identite_user?: string;

  @Column()
  type_user: string;

  @Column()
  password_user: string;

  @ManyToOne(() => Subscription, subscription => subscription.users, { cascade: true, eager: true })
  subscription: Subscription;

  @OneToMany(() => Wallet, wallet => wallet.user)
  wallets: Wallet[];
  password: string;
  transactions: any;
  forums: any;
}
