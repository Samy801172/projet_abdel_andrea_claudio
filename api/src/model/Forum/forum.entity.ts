import { User } from "model/User/user.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";




@Entity()
export class Forum {
  @PrimaryGeneratedColumn()
  id_forum: number ;

  @Column('timestamp')
  date_message_forum: Date;

  @Column('time')
  hour_message_forum: Date ;

  @ManyToMany(() => User, user => user.forums)
 users: User[] ;
  description: string ;
  name: string ;

}
