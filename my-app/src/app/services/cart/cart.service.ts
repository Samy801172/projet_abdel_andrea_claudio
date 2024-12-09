import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Cart } from '../../models/cart/cart.model';
import { CartItem } from '../../models/cart/cart-item.model';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = 'http://localhost:2024/api/cart';
  private cartSubject: BehaviorSubject<Cart>;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {
    this.cartSubject = new BehaviorSubject<Cart>({ items: [], total: 0 });
    this.loadCart();
  }

  getCartItems(): Observable<CartItem[]> {
    return this.cartSubject.asObservable().pipe(
      map(cart => cart.items)
    );
  }

  addToCart(productId: number, quantity: number = 1): Observable<Cart> {
    const clientId = localStorage.getItem('clientId');
    if (!clientId) {
      this.notificationService.error('Session expirée. Veuillez vous reconnecter.');
      return throwError(() => new Error('Client ID non trouvé'));
    }

    const payload = {
      clientId: parseInt(clientId),
      productId,
      quantity
    };

    console.log('Envoi requête avec payload:', payload);

    return this.http.post<CartItem>(`${this.apiUrl}`, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(item => {
        console.log('Réponse du serveur:', item);
        const currentCart = this.cartSubject.value;
        const existingItemIndex = currentCart.items.findIndex(i => i.productId === productId);

        let updatedItems;
        if (existingItemIndex >= 0) {
          updatedItems = currentCart.items.map((item, index) =>
            index === existingItemIndex
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          updatedItems = [...currentCart.items, item];
        }

        const updatedCart = {
          items: updatedItems,
          total: this.calculateTotal(updatedItems)
        };

        this.cartSubject.next(updatedCart);
        return updatedCart;
      }),
      tap(() => {
        this.notificationService.success("Produit ajouté au panier");
        this.loadCart();
      }),
      catchError(error => {
        console.error('Erreur addToCart:', error);
        if (error.status === 401) {
          this.notificationService.error('Session expirée. Veuillez vous reconnecter.');
        } else {
          this.notificationService.error(
            error.error?.message || "Erreur lors de l'ajout au panier"
          );
        }
        return throwError(() => error);
      })
    );
  }
  removeFromCart(cartId: number): Observable<Cart> {
    return this.http.delete<CartItem[]>(`${this.apiUrl}/${cartId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(items => {
        const currentCart = this.cartSubject.value;
        const updatedItems = currentCart.items.filter(item => item.id !== cartId);
        const updatedCart = { items: updatedItems, total: this.calculateTotal(updatedItems) };
        this.cartSubject.next(updatedCart);
        return updatedCart;
      }),
      tap(() => this.notificationService.success("Produit retiré du panier")),
      catchError(error => {
        this.notificationService.error(error.error?.message || "Erreur lors de la suppression du produit");
        return throwError(() => error);
      })
    );
  }

  updateQuantity(cartItemId: number, quantity: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(
      `${this.apiUrl}/${cartItemId}/quantity`,
      { quantity },
      { headers }
    ).pipe(
      tap(() => {
        console.log(`Quantité mise à jour - ID: ${cartItemId}, Nouvelle quantité: ${quantity}`);
      }),
      catchError(error => {
        console.error('Erreur mise à jour quantité:', error);
        return throwError(() => error);
      })
    );
  }


  private loadCart(): void {
    this.http.get<CartItem[]>(`${this.apiUrl}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map(items => ({
        items,
        total: this.calculateTotal(items)
      })),
      catchError(error => {
        this.notificationService.error("Erreur lors du chargement du panier");
        return throwError(() => error);
      })
    ).subscribe(cart => {
      this.cartSubject.next(cart);
    });
  }

  private calculateTotal(items: CartItem[]): number {
    return items.reduce((total, item) => {
      const price = typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price;
      return total + (price * item.quantity);
    }, 0);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  clearCart(): Observable<void> {
    const clientId = localStorage.getItem('clientId');
    if (!clientId) {
      return throwError(() => new Error('Client ID non trouvé'));
    }

    return this.http.delete<void>(`${this.apiUrl}/clear/${clientId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap(() => {
        // Réinitialisation du panier local après la suppression
        this.cartSubject.next({ items: [], total: 0 });
        this.notificationService.success('Panier vidé avec succès');
      }),
      catchError(error => {
        console.error('Erreur lors du vidage du panier:', error);
        this.notificationService.error('Erreur lors du vidage du panier');
        return throwError(() => error);
      })
    );
  }


}
