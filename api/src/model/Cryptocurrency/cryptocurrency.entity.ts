// src/model/Cryptocurrency/cryptocurrency.entity.ts

import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Cryptocurrency {
  @PrimaryGeneratedColumn()
  id_crypto: number;

  @Column({ type: 'varchar', length: 255 })
  name_crypto: string;

  @Column('float')
  value_crypto: number;
}