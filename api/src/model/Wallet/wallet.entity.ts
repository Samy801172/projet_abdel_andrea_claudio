// src/entities/wallet.entity.ts
import { User } from 'model/User/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id_wallet: number;

  @Column({ type: 'varchar', length: 255 })
  type_wallet: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  balance_wallet: number;

  @ManyToOne(() => User, (user) => user.wallets)
  user: User;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'user_wallets',
    joinColumn: {
      name: 'id_wallet',
      referencedColumnName: 'id_wallet'
    },
    inverseJoinColumn: {
      name: 'id_user',
      referencedColumnName: 'id_user'
    }
  })
  users: User[];
  transactions: any;
}