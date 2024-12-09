// services/checkout/checkout.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { CartService } from '../cart/cart.service';
import { OrderService } from '../order/order.service';
import { NotificationService } from '../notification/notification.service';
import { NewOrder } from '../../models/order/order.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
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
}
