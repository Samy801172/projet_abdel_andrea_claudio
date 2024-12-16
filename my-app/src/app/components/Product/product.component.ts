import { Component, OnInit } from '@angular/core';
import {CommonModule, CurrencyPipe} from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import {Product, ProductWithPromotion} from '../../models/product/product.model';
import { TypeService } from '../../services/type/type.service';
import { Type } from '../../models/type/type.model';
import { ProductService } from '../../services/product/product.service';
import {NotificationService} from '../../services/notification/notification.service';

@Component({
  selector: 'app-product',
  template: `
    <div class="products-grid">
      @for (product of filteredProducts; track product.id_product) {
        <div class="product-card">
          <div class="product-content">
            <h3>{{ product?.name }}</h3>
            <p class="description">{{ product?.description }}</p>

            <div class="price-container">
              @if (product && product.activePromotion) {
                <div class="promo-info">
                  <span class="original-price">{{ product.price | currency :'EUR' }}</span>
                  <span class="promo-price">{{ product.promotionPrice | currency:'EUR' }}</span>
                  <span class="discount-tag">
                    -{{ product.activePromotion.discountPercentage }}%
                  </span>
                </div>
              } @else {
                <span class="regular-price">{{ product?.price | currency:'EUR' }}</span>
              }
            </div>

            <div class="stock-info">
              <span [class.low-stock]="product.stock < 5">
                Stock: {{ product?.stock || 0 }}
              </span>
            </div>

            <button
              class="add-to-cart-btn"
              [disabled]="!product?.stock || product.stock <= 0"
              (click)="addToCart(product)"
            >
              @if (!product?.stock || product.stock <= 0) {
                Rupture de stock
              } @else {
                Ajouter au panier
              }
            </button>
          </div>
        </div>
      }

      @if (filteredProducts.length === 0) {
        <div class="no-products">
          <p>Aucun produit disponible</p>
        </div>
      }
    </div>
  `,
  standalone: true,
  imports: [
    CurrencyPipe
  ],
  styles: [`
    .price-container {
      margin: 1rem 0;
    }

    .promo-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .original-price {
      text-decoration: line-through;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .promo-price {
      color: #dc2626;
      font-weight: bold;
      font-size: 1.25rem;
    }

    .regular-price {
      font-size: 1.25rem;
      font-weight: 600;
      color: #4f46e5;
    }

    .discount-tag {
      background: #dc2626;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.75rem;
      display: inline-block;
      font-weight: bold;
    }

    .stock-info {
      margin-top: 0.5rem;
      font-size: 0.875rem;
    }

    .low-stock {
      color: #dc2626;
    }

    .add-to-cart-btn {
      width: 100%;
      margin-top: 1rem;
      padding: 0.75rem;
      border: none;
      border-radius: 0.375rem;
      background: #4f46e5;
      color: white;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: #4338ca;
      }

      &:disabled {
        background: #d1d5db;
        cursor: not-allowed;
      }
    }
  `]
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
