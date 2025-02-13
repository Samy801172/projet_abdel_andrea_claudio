import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('custom_requests')
export class CustomRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  instructions: string;

  @Column({ nullable: true })
  prescriptionFile: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalPrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  deposit: number;

  @Column({ default: false })
  depositPaid: boolean;

  @CreateDateColumn()
  createdAt: Date;
} 