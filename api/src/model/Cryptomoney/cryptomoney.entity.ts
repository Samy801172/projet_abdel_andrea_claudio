import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, Transaction } from 'typeorm';



@Entity()
export class Cryptomoney {
  @PrimaryGeneratedColumn()
  id_crypto: number;

  @Column()
  name_crypto: string;

  @Column()
  value_crypto: number;

  @ManyToMany(() => Cryptomoney, cryptomoney => cryptomoney.transactions)
  cryptomoney: Cryptomoney[];
  @JoinTable({
    name: 'cryptomoney_transaction',
    joinColumn: {
      name: 'id_crypto',
      referencedColumnName: 'id_crypto'
    },
    inverseJoinColumn: {
      name: 'id_transaction',
      referencedColumnName: 'id_transaction'
    }
  })
  transactions: Transaction[];
}

