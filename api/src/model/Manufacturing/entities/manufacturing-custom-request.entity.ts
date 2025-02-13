import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  ManyToOne, 
  JoinColumn 
} from 'typeorm';
import { ManufacturingStatus } from '../enums/manufacturing-status.enum';

@Entity('manufacturing_custom_requests')
export class ManufacturingCustomRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ 
    type: 'enum',
    enum: ['capsules', 'sirop', 'pommade', 'cream', 'custom'],
    default: 'custom'
  })
  type: string;

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
    enum: ManufacturingStatus,
    default: ManufacturingStatus.EN_ATTENTE_ACOMPTE
  })
  status: ManufacturingStatus;

  @CreateDateColumn()
  createdAt: Date;
} 