import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../User/user.entity';
import { Order } from '../Order/order.entity'; // Corrigé l'import
import { Appointment } from '../Appointment/appointment.entity';
import { Cart } from '../Cart/cart.entity';
import { IsNotEmpty } from 'class-validator';
import { Credential } from '@feature/security/data/entity/credential.entity';
import { Prescription } from 'model/Prescription/prescription.entity';


@Entity('client') // Nom explicite de la table
export class Client {
  @PrimaryGeneratedColumn()
  @IsNotEmpty()
  clientId: number;

  @Column()
  @IsNotEmpty()
  address: string;

  @Column({ nullable: false })
  @IsNotEmpty()
  firstName: string;

  @Column()
  @IsNotEmpty()
  lastName: string;

  @Column()
  @IsNotEmpty()
  avatar: string;

  @OneToOne(() => User, (user) => user.client, { cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Order, (order) => order.client, { cascade: true })
  orders: Order[];

  @OneToMany(() => Appointment, (appointment) => appointment.clientId, {
    cascade: true,
  })
  appointment: Appointment[];

  @OneToMany(() => Cart, (cart) => cart.client, { cascade: true })
  carts: Cart[];

  @OneToOne(() => Credential, { cascade: true })
  @JoinColumn({ name: 'credential_id' })
  credential: Credential;

  @Column({ name: 'credential_id', nullable: true })
  credentialId: string;
  @OneToMany(() => Prescription, (prescription) => prescription.client)
  prescriptions: Prescription[];

}
