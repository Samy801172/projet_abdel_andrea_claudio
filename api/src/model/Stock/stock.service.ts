import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { StockAlert } from './stock.entity';
import * as fs from 'fs';
import * as path from 'path';

//Repository permet d'interagir avec une entité spécifique dans la base de données.
//DataSource est utilisé pour exécuter des requêtes SQL brutes ou gérer des transactions.
//StockAlert : Il s'agit d'une entité définissant les alertes de stock, possiblement liée à d'autres entités (comme Product).

// src/model/Stock/stock.service.ts
@Injectable() //Indique que cette classe peut être injectée comme dépendance dans d'autres parties de l'application NestJS.
export class StockService {
  constructor(
    @InjectRepository(StockAlert) //Injecte le repository de l'entité StockAlert pour manipuler les données liées aux alertes de stock via TypeORM.
    private stockAlertRepository: Repository<StockAlert>,
    @InjectDataSource() //Injecte une instance de la source de données pour exécuter des requêtes SQL.
    private dataSource: DataSource,
  ) {}

  //Cette méthode exécute une procédure stockée (CALL update_stock_after_sale) dans la base de données pour mettre à jour
  // le stock d'un produit après une vente.
  async updateStockAfterSale(productId: number, quantity: number) {
    await this.dataSource.query(
      'CALL update_stock_after_sale($1, $2)',
      [productId, quantity], //productId : Identifiant du produit vendu.
      //quantity : Quantité vendue.
    );
  }

  async exportStockToCsv() {
    try {
      const products = await this.dataSource.query(`
        SELECT 
          id_product,
          name,
          description,
          stock,
          CAST(TRUNC(price::numeric / 100.0, 2) AS TEXT) as price  -- Conversion et division
        FROM product
      `);

      // En-tête du CSV
      let csvContent = 'Id,Nom,Description,Stock,Prix\n';

      // Ajouter les données
      products.forEach((product) => {
        csvContent += `${product.id_product},`;
        csvContent += `"${product.name.replace(/"/g, '""')}",`;
        csvContent += `"${product.description.replace(/"/g, '""')}",`;
        csvContent += `${product.stock},`;
        csvContent += `${product.price}\n`; // Le prix est déjà formaté par la requête SQL
      });

      // Ajouter BOM pour UTF-8
      const bom = '\uFEFF';
      const fileContent = bom + csvContent;

      const filePath = path.join(__dirname, '../../exports', 'stock.csv');

      if (!fs.existsSync(path.dirname(filePath))) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
      }

      fs.writeFileSync(filePath, fileContent, { encoding: 'utf8' });

      return filePath;
    } catch (error) {
      console.error('Erreur lors de la génération du CSV:', error);
      throw error;
    }
  }
  async getStockAlerts() {
    return this.stockAlertRepository.find({
      relations: ['product'],
    });
  }
}
