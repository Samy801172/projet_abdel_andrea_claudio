import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Order } from '../Order/order.entity';
import { OrderStatus } from '../OrderStatus/dto/order-status.enum';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Manufacturing {

    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Order)
    @JoinColumn({ name: 'orderId' })
    order: Order;

    @Column()
    orderId: number;

    @ApiProperty()
    @Column({ nullable: true })
    prescriptionUrl: string;

    @ApiProperty()
    @Column({ type: 'text', nullable: true })
    notes: string;

    @ApiProperty()
    @Column()
    startDate: Date;

    @ApiProperty()
    @Column({ nullable: true })
    completionDate: Date;

    @ApiProperty()
    @Column('decimal', { precision: 10, scale: 2 })
    depositAmount: number;

    @ApiProperty()
    @Column('decimal', { precision: 10, scale: 2 })
    totalAmount: number;

    @ApiProperty()
    @Column()
    depositPaid: boolean;

    @ApiProperty()
    @Column({
        type: 'enum',
        enum: OrderStatus
    })
    status: OrderStatus;

    @ApiProperty()
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt: Date;
} 