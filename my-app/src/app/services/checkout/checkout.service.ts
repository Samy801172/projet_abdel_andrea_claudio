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
  private apiUrl = 'http://localhost:2024/api/checkout';

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  createOrderFromCart(): Observable<any> {
    return this.cartService.getCartItems().pipe(
      switchMap(cartItems => {
        if (!cartItems.length) {
          return throwError(() => new Error('Le panier est vide'));
        }

        const orderData: NewOrder = {
          clientId: this.getCurrentClientId(),
          date_order: new Date().toISOString(),
          orderLines: cartItems.map(item => ({
            id_product: item.product.id_product,
            quantity: item.quantity,
            unit_price: this.getPrice(item)
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


  processPayment(paymentDetails: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/process-payment`, paymentDetails).pipe(
      catchError(error => {
        console.error('Erreur lors du traitement du paiement:', error);
        this.notificationService.error('Erreur lors du traitement du paiement');
        return throwError(() => error);
      })
    );
  }


  confirmOrder(orderId: number, paymentInfo: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/confirm-order/${orderId}`, paymentInfo).pipe(
      tap(() => {
        this.notificationService.success('Commande confirmée avec succès');
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors de la confirmation de la commande');
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

  private getPrice(item: any): number {
    // Calcul du prix en tenant compte des promotions
    if (item.product.activePromotion) {
      const discount = item.product.activePromotion.discountPercentage;
      return item.product.price * (1 - discount / 100);
    }
    return typeof item.product.price === 'string' ?
      parseFloat(item.product.price) :
      item.product.price;
  }

  validateOrder(orderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/validate/${orderId}`, {}).pipe(
      tap(() => {
        this.notificationService.success('Commande validée avec succès');
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors de la validation de la commande');
        return throwError(() => error);
      })
    );
  }

  calculateOrderTotal(items: any[]): number {
    return items.reduce((total, item) => {
      return total + (this.getPrice(item) * item.quantity);
    }, 0);
  }


}
