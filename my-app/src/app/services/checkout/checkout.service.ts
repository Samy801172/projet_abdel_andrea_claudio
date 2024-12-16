// services/checkout/checkout.service.ts
import {Component, Injectable} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { CartService } from '../cart/cart.service';
import { OrderService } from '../order/order.service';
import { NotificationService } from '../notification/notification.service';
import { NewOrder } from '../../models/order/order.model';
import {CommonModule} from '@angular/common';
import {PaymentComponent} from '../../components/payment/payment.component';
@Component({
  standalone: true,
  imports: [CommonModule, PaymentComponent],
  template: `
    <div class="checkout-container">
      <!-- Votre récapitulatif de commande existant -->

      <!-- Nouvelle section pour le paiement -->
      @if (readyToPay) {
        <app-payment
          [totalAmount]="total"
          (paymentSuccess)="onPaymentSuccess($event)"
        />
      }

      <div class="actions">
        <button class="back-btn" (click)="backToCart()">
          Retour au panier
        </button>
        <button
          *ngIf="!readyToPay"
          class="next-btn"
          (click)="readyToPay = true"
        >
          Procéder au paiement
        </button>
      </div>
    </div>
  `
})
@Injectable({
  providedIn: 'root'
})
export class CheckoutComponent {
  readyToPay = false;
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  createOrderFromCart(): Observable<any> {
    return this.cartService.getCartItems().pipe(
      switchMap(cartItems => {
        if (!cartItems.length) {
          throw new Error('Le panier est vide');
        }

        const orderData: NewOrder = {
          clientId: this.getCurrentClientId(),
          orderLines: cartItems.map(item => ({
            productId: item.product.id_product,
            quantity: item.quantity,
            price: this.getPrice(item.product.price)
          }))
        };

        return this.orderService.createOrder(orderData);
      }),
      tap(() => {
        this.cartService.clearCart().subscribe();
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors de la création de la commande');
        return throwError(() => error);
      })
    );
  }

  private getCurrentClientId(): number {
    const clientId = localStorage.getItem('clientId');
    if (!clientId) {
      throw new Error('Client ID non trouvé');
    }
    return parseInt(clientId, 10);
  }

  private getPrice(price: string | number): number {
    return typeof price === 'string' ? parseFloat(price) : price;
  }

  onPaymentSuccess(paymentInfo: any) {
    // Créer la commande finale
    const orderData = {
      ...this.getOrderData(),
      paymentInfo
    };

    this.orderService.createOrder(orderData).subscribe({
      next: (order) => {
        this.notificationService.success('Commande créée avec succès!');
        this.cartService.clearCart().subscribe();
        this.router.navigate(['/order-confirmation', order.id]);
      },
      error: (err) => {
        this.notificationService.error('Erreur lors de la création de la commande');
        console.error('Erreur commande:', err);
      }
    });
  }
}
