import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateClientAndTokenTables1706826000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Suppression des tables existantes si elles existent
    await queryRunner.dropTable('clients', true);
    await queryRunner.dropTable('client', true);
    await queryRunner.dropTable('tokens', true);
    await queryRunner.dropTable('token', true);

    // Création de la table client
    await queryRunner.createTable(
      new Table({
        name: 'client',
        columns: [
          {
            name: 'client_id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'first_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'last_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'credential_id',
            type: 'varchar',
            length: '26',
            isNullable: true,
          }
        ],
      })
    );

    // Création de la table token
    await queryRunner.createTable(
      new Table({
        name: 'token',
        columns: [
          {
            name: 'token_id',
            type: 'varchar',
            length: '26',
            isPrimary: true,
          },
          {
            name: 'token',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'refresh_token',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'credential_id',
            type: 'varchar',
            length: '26',
            isNullable: false,
          }
        ],
      })
    );

    // Ajout des clés étrangères
    await queryRunner.createForeignKey(
      'client',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'user',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'client',
      new TableForeignKey({
        columnNames: ['credential_id'],
        referencedColumnNames: ['credential_id'],
        referencedTableName: 'credential',
        onDelete: 'SET NULL',
      })
    );

    await queryRunner.createForeignKey(
      'token',
      new TableForeignKey({
        columnNames: ['credential_id'],
        referencedColumnNames: ['credential_id'],
        referencedTableName: 'credential',
        onDelete: 'CASCADE',
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('token');
    await queryRunner.dropTable('client');
  }
}