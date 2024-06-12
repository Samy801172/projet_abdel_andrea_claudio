import { User } from "model/User/user.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";




@Entity()
export class Forum {
  @PrimaryGeneratedColumn()
  id_forum: number;

  @Column()
  date_message: Date;

  @Column()
  hour_message: Date;

  @ManyToMany(() => User, user => user.forums)
  users: User[];
  message_content: string;
}
