import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOrderTables1699288000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const ordersTableExists = await queryRunner.hasTable('orders');
    const orderDetailsTableExists = await queryRunner.hasTable('order_details');

    if (!ordersTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'orders',
          columns: [
            {
              name: 'id_order',
              type: 'serial',
              isPrimary: true,
            },
            {
              name: 'id_client',
              type: 'integer',
              isNullable: false,
            },
            {
              name: 'id_statut',
              type: 'integer',
              isNullable: false,
            },
            {
              name: 'date_order',
              type: 'timestamp',
              default: 'CURRENT_TIMESTAMP',
            },
            {
              name: 'montant_total',
              type: 'decimal',
              precision: 10,
              scale: 2,
              default: 0,
            },
          ],
        })
      );

      await this.addOrdersForeignKeys(queryRunner);
    }

    if (!orderDetailsTableExists) {
      await queryRunner.createTable(
        new Table({
          name: 'order_details',
          columns: [
            {
              name: 'id_detail_commande',
              type: 'serial',
              isPrimary: true,
            },
            {
              name: 'id_commande',
              type: 'integer',
              isNullable: false,
            },
            {
              name: 'id_product',
              type: 'integer',
              isNullable: false,
            },
            {
              name: 'quantity',
              type: 'integer',
              isNullable: false,
            },
            {
              name: 'prix_unitaire',
              type: 'decimal',
              precision: 10,
              scale: 2,
              isNullable: false,
            },
          ],
        })
      );

      await this.addOrderDetailsForeignKeys(queryRunner);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('order_details');
    await queryRunner.dropTable('orders');
  }

  private async addOrdersForeignKeys(queryRunner: QueryRunner) {
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['id_client'],
        referencedColumnNames: ['client_id'],
        referencedTableName: 'client',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['id_statut'],
        referencedColumnNames: ['id_statut'],
        referencedTableName: 'order_status',  // Corrigé ici
        onDelete: 'RESTRICT',
      })
    );
  }

  private async addOrderDetailsForeignKeys(queryRunner: QueryRunner) {
    await queryRunner.createForeignKey(
      'order_details',
      new TableForeignKey({
        columnNames: ['id_commande'],
        referencedColumnNames: ['id_order'],
        referencedTableName: 'orders',
        onDelete: 'CASCADE',
      })
    );

    await queryRunner.createForeignKey(
      'order_details',
      new TableForeignKey({
        columnNames: ['id_product'],
        referencedColumnNames: ['id_product'],
        referencedTableName: 'product',
        onDelete: 'RESTRICT',
      })
    );
  }
}
