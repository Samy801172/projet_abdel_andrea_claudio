import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {Product, ProductWithPromotion} from '../../../../../models/product/product.model';
import { ProductService } from '../../../../../services/product/product.service';
import { CartService } from '../../../../../services';
import { NotificationService } from '../../../../../services/notification/notification.service';
import {FormsModule} from '@angular/forms';
import {take} from 'rxjs';
import {PromotionService} from '../../../../../services/promotion/promotion.service';
import {PromotionTimerComponent} from '../../../../../components/Promotion/promotion-timer.component';


export interface Type {
  id_type: number;
  name: string;
  description: string;
  icon: string;
  prescription_required: boolean;
  products?: Product[];

}
@Component({
  selector: 'app-client-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PromotionTimerComponent],
  templateUrl: './client-products.component.html',
  styleUrl: 'client-products.component.scss',
})
export class ClientProductsComponent implements OnInit {
  products: ProductWithPromotion[] = [];
  allProducts: ProductWithPromotion[] = [];
  selectedType: string = 'tous';
  sortOrder: string = 'default';

  // Options de tri et filtres
  typeOptions = [
    {value: 'tous', label: 'Tous les produits'},
    {value: 'promos', label: 'En promotion'},
    {value: '1', label: 'Médicaments sans ordonnance'},
    {value: '2', label: 'Médicaments sur ordonnance'},
    {value: '3', label: 'Matériel médical'},
    {value: '4', label: 'Compléments alimentaires'},
    {value: '5', label: 'Hygiène et soins'},
    {value: '6', label: 'Premiers secours'},
    {value: '7', label: 'Préparations magistrales'},
    {value: '8', label: 'Orthopédie'},
    {value: '9', label: 'Maternité et bébé'},
    {value: '10', label: 'Maintien à domicile'}
  ];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {
  }

  ngOnInit(): void {
    this.loadProducts();
  }


  // Filtrage des produits
  filterProducts(): void {
    if (this.selectedType === 'tous') {
      this.products = [...this.allProducts];
    } else if (this.selectedType === 'promos') {
      this.products = this.allProducts.filter(product => product.activePromotion);
    } else {
      const selectedTypeId = parseInt(this.selectedType);
      this.products = this.allProducts.filter(product => product.typeId === selectedTypeId);
    }
    this.sortProducts(); // Applique le tri après le filtre
  }

  // Tri des produits
  sortProducts(): void {
    this.products.sort((a, b) => {
      const priceA = a.activePromotion ? this.getDiscountedPrice(a) : a.price;
      const priceB = b.activePromotion ? this.getDiscountedPrice(b) : b.price;

      switch (this.sortOrder) {
        case 'prixCroissant':
          return priceA - priceB;
        case 'prixDecroissant':
          return priceB - priceA;
        case 'promotion':
          return (b.activePromotion ? 1 : 0) - (a.activePromotion ? 1 : 0);
        default:
          return 0;
      }
    });
  }

  // Gestion des images
  getImageFilename(productName: string): string {
    const name = productName.toLowerCase();
    if (name.includes('paracétamol')) return 'paracetamol.jpg';
    if (name.includes('ibuprofène')) return 'ibuprofene.jpg';
    if (name.includes('antibiotique')) return 'antibiotique.jpg';
    return 'default-product.jpg';
  }


  // Vérification de la disponibilité
  isProductAvailable(product: Product): boolean {
    return product.stock > 0;
  }

  // Ajout au panier
  addToCart(product: ProductWithPromotion): void {
    const clientId = localStorage.getItem('clientId');
    if (!clientId) {
      this.notificationService.error('Veuillez vous connecter pour ajouter au panier');
      return;
    }

    if (!this.isProductAvailable(product)) {
      this.notificationService.error('Ce produit est en rupture de stock');
      return;
    }

    this.cartService.getCartItems().pipe(take(1)).subscribe(items => {
      const cartItem = items.find(item => item.product.id_product === product.id_product);
      if (cartItem && cartItem.quantity >= product.stock) {
        this.notificationService.error('Stock maximum atteint pour ce produit');
        return;
      }

      const finalPrice = product.activePromotion ? this.getDiscountedPrice(product) : product.price;
      this.cartService.addToCart(product.id_product, 1).subscribe({
        next: () => {
          this.notificationService.success('Produit ajouté au panier');
          this.loadProducts();
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout au panier:', error);
          this.notificationService.error('Erreur lors de l\'ajout au panier');
        }
      });
    });
  }

  loadProducts(): void {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('Products received in component:', products);
        this.allProducts = products;
        this.products = [...this.allProducts];
        this.filterProducts();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.notificationService.error('Erreur lors du chargement des produits');
      }
    });
  }


  getEndDateFormatted(promotion: any): string {
    if (!promotion || !promotion.endDate) {
      return '';
    }

    const endDate = new Date(promotion.endDate);
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };

    return endDate.toLocaleDateString('fr-FR', options);
  }

  getPromotionStatus(promotion: any): { type: 'normal' | 'ending-soon' | 'last-day', message: string } {
    if (!promotion || !this.isPromotionActive(promotion)) {
      return {type: 'normal', message: ''};
    }

    const now = new Date();
    const endDate = new Date(promotion.endDate);
    const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return {
        type: 'last-day',
        message: 'Dernier jour !'
      };
    }

    if (diffDays <= 3) {
      return {
        type: 'ending-soon',
        message: `Plus que ${diffDays} jours !`
      };
    }

    return {
      type: 'normal',
      message: `Jusqu'au ${this.getEndDateFormatted(promotion)}`
    };
  }

  isPromotionActive(promotion: any): boolean {
    if (!promotion) return false;
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate;
  }

  getDiscountedPrice(product: ProductWithPromotion): number {
    if (product.activePromotion && this.isPromotionActive(product.activePromotion)) {
      const discountAmount = product.price * (product.activePromotion.discountPercentage / 100);
      return Number((product.price - discountAmount).toFixed(2));
    }
    return product.price;
  }


}
