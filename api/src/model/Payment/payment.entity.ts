// payment.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Order } from '../Order/order.entity';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethodEnum, PaymentStatusEnum } from './dto/create-payment.dto';

@Entity('payment')
export class Payment {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id_payment: number;

  @ApiProperty()
  @ManyToOne(() => Order, (order) => order.payments, { nullable: false })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ApiProperty({ enum: PaymentMethodEnum })
  @Column({
    type: 'enum',
    enum: PaymentMethodEnum,
    default: PaymentMethodEnum.PAYPAL
  })
  paymentMethod: PaymentMethodEnum;

  @ApiProperty()
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ enum: PaymentStatusEnum })
  @Column({
    type: 'enum',
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PENDING
  })
  paymentStatus: PaymentStatusEnum;

  @ApiProperty()
  @CreateDateColumn()
  paymentDate: Date;

  @ApiProperty()
  @Column({ nullable: true })
  paypalOrderId: string;

  @ApiProperty()
  @Column({ nullable: true })
  transactionId: string;
}