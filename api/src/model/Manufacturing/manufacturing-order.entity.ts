import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Manufacturing } from './manufacturing.entity';

@Entity()
export class ManufacturingOrder {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  status: string;

  @Column('decimal')
  totalAmount: number;

  @OneToMany(() => ManufacturingDeposit, deposit => deposit.order)
  deposits: ManufacturingDeposit[];

  @ManyToOne(() => Manufacturing)
  manufacturing: Manufacturing;
}

@Entity()
export class ManufacturingDeposit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal')
  amount: number;

  @Column()
  date: Date;

  @ManyToOne(() => ManufacturingOrder, order => order.deposits)
  order: ManufacturingOrder;
} 