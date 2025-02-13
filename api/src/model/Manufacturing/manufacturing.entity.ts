import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../Order/order.entity';
import { ManufacturingStatus } from './enums/manufacturing-status.enum';
import { Client } from '../Client/client.entity';

@Entity('manufacturing')
export class Manufacturing {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'client_id', nullable: false })
  clientId: number;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @Column({ name: 'order_id', nullable: true })
  orderId: number;

  @ManyToOne(() => Order)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({
    type: 'enum',
    enum: ManufacturingStatus,
    default: ManufacturingStatus.EN_ATTENTE_ACOMPTE
  })
  status: ManufacturingStatus;

  @Column({ type: 'varchar', nullable: true })
  type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedPrice: number;

  @Column({ type: 'varchar', nullable: true })
  prescriptionPath: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  estimatedCompletionDate: Date;

  @Column({ nullable: true })
  notes: string;

  @Column({ nullable: true })
  customRequestId: number;

  @Column('jsonb', { nullable: true })
  prescriptionDetails: {
    doctor: {
      name: string;
      address: string;
      rpps: string;
    };
    prescription: {
      date: string;
      patient: string;
      composition: Array<{
        name: string;
        dosage: string;
      }>;
      posology: string;
      duration: string;
    };
  };
} 