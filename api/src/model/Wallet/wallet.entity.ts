import { User } from '../User/user.entity'
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id_wallet: number;

  @Column()
  typeTransaction: string;

  @Column({ name: 'amount_transaction' })
  amount_transaction: number;

  @Column({ name: 'type_money_transaction' })
  type_money_transaction: string;

  @Column()
  date_transaction: Date;

  @Column()
  hour_transaction: Date;

  @Column()
  price_transaction: number;

  @Column({ name: 'user_id_fk' })
  user_id_fk: number;

  @ManyToMany(() => User, user => user.wallets)
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

  // Assurez-vous de définir transactions si nécessaire
  transactions: any;
}
