import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services';
import { CartItem } from '../../models/cart/cart-item.model';
import { NotificationService } from '../../services/notification/notification.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cart-container">
      <h2>Mon Panier</h2>

      <div *ngIf="items.length === 0" class="empty-cart">
        Votre panier est vide
      </div>

      <div *ngIf="items.length > 0" class="cart-items">
        <div *ngFor="let item of items" class="cart-item">
          <div class="item-info">
            <h3>{{ item.product.name }}</h3>
            <p>Prix: {{ getPrice(item.product.price) | currency:'EUR' }}</p>

            <div class="quantity-controls">
              <button
                (click)="decrementQuantity(item)"
                [disabled]="item.quantity <= 1"
                class="quantity-btn"
              >
                -
              </button>
              <span class="quantity">{{ item.quantity }}</span>
              <button
                (click)="incrementQuantity(item)"
                [disabled]="item.quantity >= item.product.stock"
                class="quantity-btn"
              >
                +
              </button>
            </div>

            <p>Sous-total: {{ getSubTotal(item) | currency:'EUR' }}</p>
          </div>

          <button (click)="removeItem(item)" class="remove-btn">
            Supprimer
          </button>
        </div>

        <div class="cart-summary">
          <p class="total">Total: {{ total | currency:'EUR' }}</p>
          <button (click)="clearCart()" class="clear-btn">
            Vider le panier
          </button>
          <button (click)="proceedToCheckout()" class="checkout-btn">
            Commander
          </button>
        </div>
      </div>
    </div>

  `,
  styles: [`
    .cart-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }

    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      margin-bottom: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 1rem 0;
    }

    .quantity-btn {
      padding: 0.5rem 1rem;
      background-color: #4f46e5;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .quantity-btn:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }

    .quantity-btn:hover:not(:disabled) {
      background-color: #4338ca;
    }

    .quantity {
      padding: 0.5rem 1rem;
      min-width: 3rem;
      text-align: center;
      border: 1px solid #e5e7eb;
      border-radius: 4px;
    }

    .remove-btn {
      padding: 5px 10px;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .cart-summary {
      margin-top: 20px;
      padding: 15px;
      border-top: 2px solid #ddd;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .total {
      font-size: 1.2em;
      font-weight: bold;
    }

    .checkout-btn {
      padding: 10px 20px;
      background: #059669;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
    }

    .clear-btn {
      padding: 10px 20px;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 10px;
    }

    .empty-cart {
      text-align: center;
      padding: 20px;
      color: #666;
    }
  `]
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  total: number = 0;

  constructor(
    private cartService: CartService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCartItems().subscribe({
      next: (items: CartItem[]) => {
        this.items = items;
        this.calculateTotal();
      },
      error: (error: Error) => {
        this.notificationService.error('Erreur lors du chargement du panier');
      }
    });
  }
  getPrice(price: string | number): number {
    return typeof price === 'string' ? parseFloat(price) : price;
  }
  incrementQuantity(item: CartItem): void {
    if (!item.id) return;

    const newQuantity = item.quantity + 1;
    if (newQuantity > item.product.stock) {
      this.notificationService.error('Stock maximum atteint');
      return;
    }

    this.cartService.updateQuantity(item.id, newQuantity).subscribe({
      next: () => {
        item.quantity = newQuantity;
        this.calculateTotal();
        this.notificationService.success('Quantité mise à jour');
      },
      error: (error) => {
        console.error('Erreur mise à jour quantité:', error);
        this.notificationService.error('Erreur lors de la mise à jour de la quantité');
      }
    });
  }


  decrementQuantity(item: CartItem): void {
    if (!item.id) return;

    const newQuantity = item.quantity - 1;
    if (newQuantity < 1) {
      this.notificationService.error('Quantité minimum atteinte');
      return;
    }

    this.cartService.updateQuantity(item.id, newQuantity).subscribe({
      next: () => {
        item.quantity = newQuantity;
        this.calculateTotal();
        this.notificationService.success('Quantité mise à jour');
      },
      error: (error) => {
        console.error('Erreur mise à jour quantité:', error);
        this.notificationService.error('Erreur lors de la mise à jour de la quantité');
      }
    });
  }

  updateCartItemQuantity(item: CartItem, newQuantity: number): void {
    if (!item.id) {
      this.notificationService.error('ID de l\'article manquant');
      return;
    }

    console.log(`Mise à jour quantité - ID: ${item.id}, Nouvelle quantité: ${newQuantity}`);

    this.cartService.updateQuantity(item.id, newQuantity).subscribe({
      next: (updatedCart) => {
        console.log('Panier mis à jour:', updatedCart);
        this.calculateTotal();
      },
      error: (error) => {
        console.error('Erreur mise à jour quantité:', error);
        this.notificationService.error('Erreur lors de la mise à jour de la quantité');
      }
    });
  }


  getSubTotal(item: CartItem): number {
    return this.getPrice(item.product.price) * item.quantity;
  }

  calculateTotal(): void {
    this.total = this.items.reduce((sum, item) =>
      sum + (this.getPrice(item.product.price) * item.quantity), 0
    );
  }

  removeItem(item: CartItem): void {
    if (!item.id) {
      this.notificationService.error('ID de l\'article manquant');
      return;
    }

    this.cartService.removeFromCart(item.id).subscribe({
      next: () => {
        this.items = this.items.filter(i => i.id !== item.id);
        this.calculateTotal();
        this.notificationService.success('Produit retiré du panier');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.notificationService.error('Erreur lors de la suppression du produit');
      }
    });
  }

  clearCart(): void {
    this.cartService.clearCart().subscribe({
      next: () => {
        this.items = [];
        this.total = 0;
        this.notificationService.success('Panier vidé');
      },
      error: (error: Error) => {
        this.notificationService.error('Erreur lors du vidage du panier');
      }
    });
  }
  proceedToCheckout(): void {
    if (this.items.length === 0) {
      this.notificationService.error('Votre panier est vide');
      return;
    }

    console.log('Navigation vers le checkout');
    this.router.navigate(['/client/checkout']).then(
      () => console.log('Navigation réussie vers checkout'),
      error => {
        console.error('Erreur de navigation:', error);
        this.notificationService.error('Erreur lors de l\'accès au checkout');
      }
    );
  }
  updateQuantity(item: CartItem, change: number): void {
    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      this.notificationService.error("La quantité doit être supérieure à zéro.");
      return;
    }

    this.cartService.updateQuantity(item.id, newQuantity).subscribe({
      next: (updatedCart) => {
        console.log('Panier mis à jour:', updatedCart);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la quantité:', error);
      }
    });
  }


}
