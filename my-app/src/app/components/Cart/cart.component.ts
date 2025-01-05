import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services';
import { CartItem } from '../../models/cart/cart-item.model';
import { NotificationService } from '../../services/notification/notification.service';
import { Router } from '@angular/router';
import {PromotionService} from '../../services/promotion/promotion.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule],


  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  items: CartItem[] = [];
  total: number = 0;

  constructor(
    private cartService: CartService,
    private promotionService: PromotionService,
    private notificationService: NotificationService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCartItems().subscribe({
      next: (items: CartItem[]) => {
        this.items = items;
        this.calculateTotal();
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement du panier');
      }
    });
  }
  hasActivePromotion(item: CartItem): boolean {
    return !!item.product.promotion && this.isPromotionActive(item.product.promotion);
  }


  incrementQuantity(item: CartItem): void {
    const newQuantity = item.quantity + 1;

    if (newQuantity > item.product.stock) {
      this.notificationService.error('Stock maximum atteint');
      return;
    }

    this.updateCartItemQuantity(item, newQuantity);
  }

  decrementQuantity(item: CartItem): void {
    const newQuantity = item.quantity - 1;

    if (newQuantity < 1) {
      this.notificationService.error('Quantité minimum atteinte');
      return;
    }

    this.updateCartItemQuantity(item, newQuantity);
  }

  updateCartItemQuantity(item: CartItem, newQuantity: number): void {
    this.cartService.updateQuantity(item.id, newQuantity).subscribe({
      next: () => {
        item.quantity = newQuantity;
        this.calculateTotal();
      },
      error: () => {
        this.notificationService.error('Erreur lors de la mise à jour de la quantité');
      }
    });
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id).subscribe({
      next: () => {
        this.items = this.items.filter(i => i.id !== item.id);
        this.calculateTotal();
      },
      error: () => {
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
      error: () => {
        this.notificationService.error('Erreur lors du vidage du panier');
      }
    });
  }

  proceedToCheckout(): void {
    if (this.items.length === 0) {
      this.notificationService.error('Votre panier est vide');
      return;
    }

    this.router.navigate(['/client/checkout']).then(
      () => this.notificationService.success('Redirection vers le checkout'),
      () => this.notificationService.error('Erreur lors de l\'accès au checkout')
    );
  }

  getItemPrice(item: CartItem): number {
    if (this.hasActivePromotion(item)) {
      return item.product.price * (1 - (item.product.promotion?.discountPercentage || 0) / 100);
    }
    return item.product.price;
  }


  getSubTotal(item: CartItem): number {
    return this.getItemPrice(item) * item.quantity;
  }

  calculateTotal(): void {
    this.total = this.items.reduce((sum, item) => sum + this.getSubTotal(item), 0);
  }

  getDiscountedPrice(product: any): number {
    if (!product.activePromotion || !this.isPromotionActive(product.activePromotion)) {
      return product.price;
    }

    const discount = product.activePromotion.discountPercentage;
    const discountedPrice = product.price * (1 - discount / 100);
    return Number(discountedPrice.toFixed(2));
  }

  isPromotionActive(promotion: any): boolean {
    if (!promotion) return false;
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate;
  }

}
