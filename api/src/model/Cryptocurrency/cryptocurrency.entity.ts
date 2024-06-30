
import { Transaction } from 'model/Transaction/transaction.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany,JoinTable } from 'typeorm';

@Entity()
export class Cryptocurrency {
  @PrimaryGeneratedColumn()
  id_crypto: number;

  @Column({ type: 'varchar', length: 255 })
  name_crypto: string;

  @Column('float')
  value_crypto: number;
  @ManyToMany(() => Transaction, Transaction => Transaction.cryptocurrency)
  @JoinTable({
    name: 'cryptocurrency_transaction',
    joinColumn: {
      name: 'id_crypto',
      referencedColumnName: 'id_crypto'
    },
    inverseJoinColumn: {
      name: 'id_transaction',
      referencedColumnName: 'id_transaction'
    }
  })
  transactions: Transaction[] | undefined;
  static transactions: any;

}
