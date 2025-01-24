// Importation des modules nécessaires d'Angular et des fichiers liés.
import { Component, OnInit } from '@angular/core'; // Décorateur Component et interface OnInit pour le cycle de vie Angular.
import { CommonModule } from '@angular/common'; // Module commun pour les fonctionnalités Angular standards.
import { StockService } from '../../../../../services/stock/stock.service'; // Service personnalisé pour gérer les appels relatifs au stock.
import { Product } from '../../../../../models/product/product.model'; // Modèle représentant un produit.

// Déclaration du composant Angular avec son sélecteur, ses dépendances et son template.
@Component({
  selector: 'app-stock-management', // Nom utilisé pour insérer ce composant dans un template HTML.
  standalone: true, // Composant autonome, sans inclusion dans un module Angular parent.
  imports: [CommonModule], // Modules nécessaires pour ce composant.
  templateUrl:'./stock-management.component.html',
  styleUrl: './stock-management.component.scss'
})
export class StockManagementComponent implements OnInit {
  products: Product[] = []; // Tableau pour stocker les produits.
  stockAlerts: any[] = []; // Tableau pour stocker les alertes de stock.

  // Injection du service StockService dans le constructeur.
  constructor(private stockService: StockService) {}

  // Méthode du cycle de vie Angular appelée à l'initialisation du composant.
  ngOnInit() {
    this.loadProducts(); // Charge les produits depuis le service.
    this.loadStockAlerts(); // Charge les alertes de stock depuis le service.
  }

  // Récupère la liste des produits depuis l'API.
  loadProducts() {
    this.stockService.getProducts().subscribe({
      next: (data) => this.products = data, // Met à jour le tableau de produits.
      error: (err) => console.error('Erreur chargement produits:', err) // Gère les erreurs.
    });
  }

  //Evite de recrée tous les éléments DOM à chaque changement dans la liste
  trackById(index: number, item: any): number {
    return item.id; // Remplace `id` par le nom exact de la clé unique de ton produit
  }


  // Récupère les alertes de stock depuis l'API.
  loadStockAlerts() {
    this.stockService.getStockAlerts().subscribe({
      next: (data) => this.stockAlerts = data, // Met à jour les alertes de stock.
      error: (err) => console.error('Erreur chargement alertes:', err) // Gère les erreurs.
    });
  }

  // Exporte les données de stock sous forme de fichier CSV.
  exportStock() {
    this.stockService.downloadStockCsv().subscribe({
      next: (blob) => {
        // Crée une URL temporaire pour télécharger le fichier.
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'stock.csv'; // Nom du fichier téléchargé.
        link.click(); // Simule un clic pour lancer le téléchargement.
        window.URL.revokeObjectURL(url); // Nettoie l'URL temporaire.
      },
      error: (err) => console.error('Erreur export:', err) // Gère les erreurs.
    });
  }
}
