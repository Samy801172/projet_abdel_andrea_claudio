import { User } from '../User/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Subscription {
  @PrimaryGeneratedColumn()
  id_subscription: number;

  @Column()
  name_subscription: string;

  @Column()
  price: number;

  @Column()
  description: string;

  @Column()
  duration: number;

  @OneToMany(() => User, user => user.subscription)
  users: User[];
}
