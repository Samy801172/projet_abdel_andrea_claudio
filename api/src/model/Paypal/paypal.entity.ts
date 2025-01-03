import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity('paypal_payment')
export class PaypalPayment {

  @ApiProperty({ example: 'PAYPAL-ORDER-123' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  orderId: string; // Référence à l'ordre PayPal

  @ApiProperty({ example: 99.99 })
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number; // Montant payé

  @ApiProperty({ enum: ['Completed', 'Pending', 'Failed'] })
  @Column()
  status: string; // Statut du paiement: 'Completed', 'Pending', 'Failed'

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date; // Date de création du paiement
}
