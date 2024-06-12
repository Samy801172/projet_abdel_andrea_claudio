import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Wallet } from '../Wallet/wallet.entity';
import { Subscription } from '../Subscription/subscription.entity';
import { Transaction } from '../Transaction/transaction.entity';
import { Forum } from '../Forum/forum.entity';

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
  phone: number;

  @Column()
  statut_verif_identite_user: string;

  @Column()
  type_user: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  id_subscription_fk: number;

  @OneToMany(() => Subscription, subscription => subscription.users, { cascade: true, eager: true })
  subscriptions: Subscription[];

  @ManyToMany(() => Transaction)
  @JoinTable({
    name: 'user_transactions',
    joinColumn: { name: 'id_user', referencedColumnName: 'id_user' },
    inverseJoinColumn: { name: 'id_transaction', referencedColumnName: 'id_transaction' }
  })
  transactions: Transaction[];

  @ManyToMany(() => Forum)
  @JoinTable({
    name: 'user_forums',
    joinColumn: { name: 'id_user', referencedColumnName: 'id_user' },
    inverseJoinColumn: { name: 'id_forum', referencedColumnName: 'id_forum' }
  })
  forums: Forum[];

  @ManyToMany(() => Wallet, wallet => wallet.users)
  wallets: Wallet[];


  subscription: any;
}
