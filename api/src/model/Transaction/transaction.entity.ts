import { Entity, Column, ManyToOne, PrimaryGeneratedColumn, ManyToMany } from 'typeorm';
import { User } from 'model/User/user.entity';
import { Wallet } from 'model/Wallet/wallet.entity';
import { Cryptocurrency } from '../Cryptocurrency/cryptocurrency.entity';

@Entity()
export class Transaction {

  @PrimaryGeneratedColumn({ name: 'transaction_id' })
  id_transaction: number;

  @Column({ name: 'type_transaction' })
  typeTransaction: string;

  @Column({ name: 'amount_transaction' })
  amount_transaction: number;

  @Column({ name: 'transaction_currency_type' })
  type_money_transaction: number;

  @Column({ name: 'date_transaction' })
  date_transaction: Date;

  @Column({ name: 'time_transaction' })
  time_transaction: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'transaction_cost' })
  transaction_cost: number;

  @Column({ name: 'id_user_fk' })
  id_user_fk: number;

  @ManyToMany(() => User, user => user.transactions)
  user: User ;

  @ManyToMany(() => Wallet, wallet => wallet.transactions)
  wallet: Wallet ;

  @ManyToMany(() => Cryptocurrency, (cryptocurrency: any) => Cryptocurrency.transactions)
  cryptocurrency: Cryptocurrency ;
}



