import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Client } from '../Client/client.entity';
import { Administrator } from '../Administrator/administrator.entity';
import { Service } from '../Service/service.entity';

@Entity('appointment')
export class Appointment {
  @PrimaryGeneratedColumn()
  appointmentId: number;

  @Column()
  appointmentDate: Date;

  @Column()
  time: string;

  @Column()
  note: string;

  @Column()
  serviceId: number;

  @Column()
  clientId: number;

  @ManyToOne(() => Service, (service) => service.appointment)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @ManyToOne(() => Client, (client) => client.appointment)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @ManyToOne(() => Administrator, (admin) => admin.appointment, { nullable: true })
  @JoinColumn({ name: 'administratorAdminId' })
  administrator?: Administrator;

  @Column()
  status: string;
}

