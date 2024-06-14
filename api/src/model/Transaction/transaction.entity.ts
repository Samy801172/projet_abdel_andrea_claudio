import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from 'model/User/user.entity'; // Assurez-vous du chemin correct vers User

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

  @ManyToOne(() => User, user => user.transactions)
  user: User;
  transaction_currency_type: string;


}
