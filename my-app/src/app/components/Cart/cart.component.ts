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
  templateUrl: './cart.component.html',
  styleUrls:['./cart.component.scss'],
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
