// src/model/Stock/stock.controller.ts
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { StockService } from './stock.service';
import { ProductService } from '../Product/product.service'; // Vérifiez que ce service existe.

@Controller('stock')
export class StockController {
  constructor(
    private readonly stockService: StockService,
    private readonly productService: ProductService // Injection de ProductService
  ) {}

  @Get('products')
  async getProducts() {
    try {
      return await this.productService.findAll(); // Vérifiez que la méthode `findAll` existe
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  }

  @Get('alerts')
  async getStockAlerts() {
    try {
      return await this.stockService.getStockAlerts(); // Gestion des alertes de stock
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes de stock:', error);
      throw error;
    }
  }

  @Get('export')
  async exportStock(@Res() res: Response) {
    try {
      const filePath = await this.stockService.exportStockToCsv(); // Génération du fichier CSV
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="stock.csv"');
      res.download(filePath); // Permet de télécharger le fichier
    } catch (error) {
      console.error('Erreur lors de l’exportation du stock:', error);
      throw error;
    }
  }
}
