// src/model/Cryptocurrency/cryptocurrency.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Cryptocurrency {
  @PrimaryGeneratedColumn()
  id_crypto: number;

  @Column()
  name_crypto: string;

  @Column()
  value_crypto: number;
}
