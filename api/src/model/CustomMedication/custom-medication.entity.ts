import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Client } from '../Client/client.entity';

@Entity('custom_medications')
export class CustomMedication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text')
  description: string;

  @Column('text', { nullable: true })
  instructions: string;

  @Column('decimal', { precision: 10, scale: 2 })
  estimatedPrice: number;

  @Column({ nullable: true })
  prescriptionPath: string;

  @Column({ 
    type: 'enum',
    enum: ['pending', 'in_progress', 'quality_check', 'completed'],
    default: 'pending'
  })
  status: string;

  @Column({ default: false })
  isPaid: boolean;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  clientId: number;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'clientId' })
  client: Client;
} 