import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CartService} from '../../services';
import {Product} from '../../models/product/product.model';
import {ProductService} from '../../services/product/product.service';
import {NotificationService} from '../../services/notification/notification.service';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-list.component.html',
})

export class ProductListComponent implements OnInit {
  products: Product[] = [];

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        console.log('Produits chargés:', products); // Debug
        this.products = products;
      },
      error: (error) => {
        console.error('Erreur chargement produits:', error); // Debug
        this.notificationService.error('Erreur lors du chargement des produits');
      }
    });
  }

  addToCart(product: Product) {
    if (product.stock > 0) {
      this.cartService.addToCart(product.id_product, 1).subscribe({
        next: () => this.notificationService.success('Produit ajouté au panier'),
        error: () => this.notificationService.error('Erreur lors de l\'ajout au panier')
      });
    }
  }

  calculateDiscount(product: Product): number {
    if (product.price && product.promotionPrice) {
      return Math.round((1 - product.promotionPrice / product.price) * 100);
    }
    return 0;
  }
}
