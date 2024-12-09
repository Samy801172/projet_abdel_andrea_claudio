import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Order } from '../Order/order.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('payment')
export class Payment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id_payment: number;

  @ManyToOne(() => Order, (order) => order.id_order, { nullable: false })
  order: Order;
  @ApiProperty()
  @Column()
  paymentMethod: string; // Par exemple: 'PayPal', 'Stripe'
  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number; // Montant payé
  @ApiProperty()
  @Column()
  paymentStatus: string; // Statut du paiement: 'Completed', 'Pending', 'Failed'
  @ApiProperty()
  @CreateDateColumn()
  paymentDate: Date; // Date de paiement
}
