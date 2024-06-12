import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Cryptomoney } from '../Cryptomoney/cryptomoney.entity';
import { User } from '../User/user.entity';
import { Wallet } from '../Wallet/wallet.entity';

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn({ name: 'transaction_id' })
  id_transaction: number;

  @Column()
  type: string;

  @Column()
  amount: number;

  @Column({ name: 'cryptomoney_id' }) // Assuming this column name matches the actual column name in the Cryptomoney table
  cryptomoneyId: number;

  @ManyToOne(() => Cryptomoney, cryptomoney => cryptomoney.transactions)
  cryptomoney: Cryptomoney;

  @Column({ name: 'wallet_id' }) // Assuming this column name matches the actual column name in the Wallet table
  walletId: number;

  @ManyToOne(() => Wallet, wallet => wallet.transactions)
  wallet: Wallet;

  @Column({ name: 'user_id' }) // Assuming this column name matches the actual column name in the User table
  userId: number;

  @ManyToOne(() => User, user => user.transactions)
  user: User;
}
