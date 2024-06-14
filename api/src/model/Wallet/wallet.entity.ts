import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../User/user.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id_wallet: number;

  @Column()
  type_wallet: string;

  @Column('decimal')
  balance_wallet: number;

  @Column()
  id_user_fk: number;

  @ManyToOne(() => User, user => user.wallets)
  user: User;
}
