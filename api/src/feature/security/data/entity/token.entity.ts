import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { ulid } from 'ulid';
import { Credential, SignupPayload} from "@feature/security/data";


@Entity()
export class Token {
  @PrimaryColumn('varchar', { length:26, default: () => `'${ulid()}'` })
  token_id: string;
  @Column({nullable: false})
  token: string;
  @Column({nullable: false})
  refreshToken: string;
  @OneToOne(() => Credential,{eager:true})
  @JoinColumn({name: 'credential_id_fk'})
  credential: Credential
}
