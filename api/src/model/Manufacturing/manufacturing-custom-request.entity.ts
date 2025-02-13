import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ManufacturingStatus } from './enums/manufacturing-status.enum';

@Entity('manufacturing_custom_requests')
export class ManufacturingCustomRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'client_id' })
  clientId: number;

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
} 