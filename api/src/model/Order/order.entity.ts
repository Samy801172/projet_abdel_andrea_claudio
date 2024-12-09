import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Client } from '../Client/client.entity';
import { OrderStatus } from 'model/OrderStatus/orderStatus.entity';

import { Invoice } from 'model/Invoice/invoice.entity';
import { OrderDetail } from './OrderDetail/order-detail.entity';


@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id_order: number;

  @Column({ name: 'id_client' })
  id_client: number;

  @Column({ name: 'id_statut' })
  id_statut: number;

  @Column({ type: 'timestamp' })
  date_order: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  montant_total: number;

  @ManyToOne(() => Client)
  @JoinColumn({ name: 'id_client' })
  client: Client;

  @ManyToOne(() => OrderStatus)
  @JoinColumn({ name: 'id_statut' })
  status: OrderStatus;

  @OneToMany(() => OrderDetail, orderDetail => orderDetail.order)
  orderDetails: OrderDetail[];

  @OneToMany(() => Invoice, invoice => invoice.order)
  invoices: Invoice[];
}