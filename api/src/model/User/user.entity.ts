// src/entities/user.entity.ts
import { Forum } from 'model/Forum/forum.entity';
import { Subscription } from 'model/Subscription/subscription.entity';
import { Transaction } from 'model/Transaction/transaction.entity';
import { Wallet } from 'model/Wallet/wallet.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, ManyToMany, JoinTable } from 'typeorm';


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
  password: string;

  @ManyToOne(() => Subscription, (subscription) => subscription.users, { cascade: true, eager: true })
  subscription: Subscription;

  @OneToMany(() => Wallet, (wallet) => wallet.user)
  wallets: Wallet[];

  @ManyToMany(() => Transaction)
  @JoinTable({
    name: 'user_transactions',
    joinColumn: { name: 'id_user', referencedColumnName: 'id_user' },
    inverseJoinColumn: { name: 'id_transaction_fk', referencedColumnName: 'id_transaction' }
  })
  transactions: Transaction[];

  @ManyToMany(() => Forum)
  @JoinTable({
    name: 'user_forums',
    joinColumn: { name: 'id_user', referencedColumnName: 'id_user' },
    inverseJoinColumn: { name: 'id_forum_fk', referencedColumnName: 'id_forum' }
  })
  forums: Forum[];
  password_user: string;
}
