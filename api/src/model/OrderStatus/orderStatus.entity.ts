// src/model/OrderStatus/orderStatus.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from '../Order/order.entity';

@Entity('order_status')
export class OrderStatus {
  @PrimaryGeneratedColumn()
  statusId: number;

  @Column()
  label: string;

  @OneToMany(() => Order, order => order.status)
  orders: Order[];
}