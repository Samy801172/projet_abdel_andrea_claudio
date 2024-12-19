import { Component} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {ProductWithPromotion} from '../../models/product/product.model';
import { ProductService } from '../../services/product/product.service';
import {NotificationService} from '../../services/notification/notification.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  standalone: true,
  imports: [
    CurrencyPipe
  ],
  styleUrls: ['./product.component.scss']

})
export class ProductComponent {
  filteredProducts: ProductWithPromotion[] = [];
  products: ProductWithPromotion[] = [];

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService
  ) {}

  addToCart(product: ProductWithPromotion): void {
    if (!product?.stock || product.stock <= 0) {
      this.notificationService.error('Produit en rupture de stock');
      return;
    }

    this.productService.addToCart(product, 1).subscribe({
      next: () => {
        this.notificationService.success('Produit ajouté au panier');
      },
      error: () => {
        this.notificationService.error('Erreur lors de l\'ajout au panier');
      }
    });
  }
}
