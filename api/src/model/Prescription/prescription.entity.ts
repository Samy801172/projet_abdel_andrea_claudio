// src/models/prescription/prescription.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn, JoinColumn
} from "typeorm";
import { Client } from 'model/Client/client.entity';
import { ApiProperty } from '@nestjs/swagger';

export enum PrescriptionStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
}

@Entity('prescription')
export class Prescription {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id_prescription: number;

  @ManyToOne(() => Client, (client) => client.prescriptions)
  @JoinColumn({ name: 'client_id' }) // Facultatif si tu veux un contrôle explicite
  client: Client;


  @Column()
  @ApiProperty()
  client_id: number; // Snake case pour cohérence avec la DB

  @Column()
  @ApiProperty()
  prescribed_by: string; // Renamed from doctorName for consistency

  @Column({ type: 'text' })
  @ApiProperty()
  medication_details: string;

  @CreateDateColumn()
  @ApiProperty()
  issue_date: Date;

  @Column({ type: 'date' })
  @ApiProperty()
  expiry_date: Date;

  @Column({ nullable: true })
  @ApiProperty()
  file_url: string;

  @Column({
    type: 'enum',
    enum: PrescriptionStatus,
    default: PrescriptionStatus.PENDING,
  })
  @ApiProperty({ enum: PrescriptionStatus })
  status: PrescriptionStatus;

  @Column({ default: false })
  @ApiProperty()
  is_custom: boolean;

  @Column({ type: 'integer', nullable: true })
  @ApiProperty()
  verified_by: number;

  @Column({ type: 'timestamp', nullable: true })
  @ApiProperty()
  verification_date: Date;

  @Column({ type: 'text', nullable: true })
  @ApiProperty()
  notes: string;
}
