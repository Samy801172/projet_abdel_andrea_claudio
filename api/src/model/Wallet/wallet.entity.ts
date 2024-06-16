// src/entities/wallet.entity.ts
import { User } from 'model/User/user.entity';
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';


@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id_wallet: number;

  @Column({ type: 'varchar', length: 255 })
  type_wallet: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance_wallet: number;

  @ManyToOne(() => User, user => user.wallets)
  user: User;
}
