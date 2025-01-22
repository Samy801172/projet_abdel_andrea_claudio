import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Client } from '../Client/client.entity';
import { Administrator } from '../Administrator/administrator.entity';
import { Service } from '../Service/service.entity';

@Entity()
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

  @ManyToOne(() => Service, (service) => service.appointments)
  @JoinColumn({ name: 'serviceId' })
  service: Service;

  @ManyToOne(() => Client, (client) => client.appointments)
  @JoinColumn({ name: 'clientId' })
  client: Client;

  @ManyToOne(() => Administrator, (admin) => admin.appointments, { nullable: true })
  @JoinColumn({ name: 'administratorAdminId' })
  administrator?: Administrator;

  @Column()
  status: string;
}

