// src/migrations/InsertOrderStatuses.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InsertOrderStatuses implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO order_status (id_statut, label) VALUES
      (1, 'En attente'),
      (2, 'En cours de traitement'),
      (3, 'Expédié'),
      (4, 'Livré'),
      (5, 'Annulé')
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM order_status`);
  }
}