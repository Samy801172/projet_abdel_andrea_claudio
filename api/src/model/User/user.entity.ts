import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Subscription } from '../Subscription/subscription.entity';

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
  wallets: any;
  transactions: any;
  forums: any;
}
