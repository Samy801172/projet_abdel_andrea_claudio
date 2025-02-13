import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Manufacturing } from './manufacturing.entity';

@Entity()
export class ManufacturingDeposit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column()
  date: Date;

  @ManyToOne(() => Manufacturing)
  manufacturing: Manufacturing;
} 