// src/model/OrderStatus/orderStatus.entity.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from '../Order/order.entity';
import { OrderStatus } from './dto/order-status.enum';




@Entity('order_status')
export class OrderStatusEntity {
  @PrimaryGeneratedColumn()
  statusId: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  label: OrderStatus;

  @Column()
  description: string;

  @OneToMany(() => Order, order => order.status)
  orders: Order[];
}
