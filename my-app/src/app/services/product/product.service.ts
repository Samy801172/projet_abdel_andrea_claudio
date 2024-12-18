import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import {Product, ProductWithPromotion} from '../../models/product/product.model';
import { NotificationService } from '../notification/notification.service';

export interface CartItem {
  productId: number;
  quantity: number;
  product?: Product;
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private readonly API_URL = 'http://localhost:2024/api/products';
  private cartItems = new BehaviorSubject<CartItem[]>([]);

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}





  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.API_URL, product).pipe(
      catchError(error => {
        this.notificationService.error('Erreur lors de la création du produit');
        return throwError(() => error);
      })
    );
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/${id}`, product).pipe(
      catchError(error => {
        this.notificationService.error('Erreur lors de la mise à jour du produit');
        return throwError(() => error);
      })
    );
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(error => {
        this.notificationService.error('Erreur lors de la suppression du produit');
        return throwError(() => error);
      })
    );
  }

  addToCart(product: Product, quantity: number): Observable<void> {
    const cartItem: CartItem = {
      productId: product.id_product,
      product: product,
      quantity: quantity


    };

    const currentCart = this.cartItems.value;
    const existingItem = currentCart.find(item => item.productId === product.id_product);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentCart.push(cartItem);
    }

    this.cartItems.next([...currentCart]);
    this.saveCartToLocalStorage();

    return new Observable<void>(observer => {
      observer.next();
      observer.complete();
    });
  }

  private saveCartToLocalStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
  }
  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.API_URL}/add`, product);
  }

  removePromotion(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${productId}/promotions`).pipe(
      catchError(error => {
        console.error('Erreur suppression promotion:', error);
        throw error;
      })
    );
  }





  // Mettez à jour cette méthode pour gérer les promotions lors de l'application
  applyPromotion(productId: number, promotionId: number): Observable<any> {
    return this.http.post(`${this.API_URL}/${productId}/apply-promotion`, { promotionId }).pipe(
      tap(() => console.log('Promotion appliquée avec succès')),
      catchError(error => {
        console.error('Erreur lors de l\'application de la promotion:', error);
        this.notificationService.error('Erreur lors de l\'application de la promotion');
        return throwError(() => error);
      })
    );
  }
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`).pipe(
      map(product => ({
        ...product,
        imageUrls: product.imageUrls || [] // Garantir qu'imageUrls est toujours un tableau
      })),
      catchError(error => {
        this.notificationService.error('Erreur lors du chargement du produit');
        return throwError(() => error);
      })
    );
  }
  // product.service.ts
  getAllProducts(): Observable<ProductWithPromotion[]> {
    return this.http.get<any[]>(this.API_URL).pipe(
      tap(rawProducts => console.log('Raw products:', rawProducts)), // Debug
      map(products => products.map(product => {
        // Log pour déboguer
        console.log('Mapping product:', product);

        if (product.promotion) {
          const discountedPrice = product.price * (1 - product.promotion.discountPercentage / 100);
          return {
            ...product,
            activePromotion: {
              id_promotion: product.promotion.id_promotion,
              description: product.promotion.description,
              discountPercentage: product.promotion.discountPercentage,
              startDate: product.promotion.startDate,
              endDate: product.promotion.endDate
            },
            promotionPrice: Number(discountedPrice.toFixed(2))
          };
        }
        return {
          ...product,
          activePromotion: null,
          promotionPrice: product.price
        };
      })),
      tap(mappedProducts => console.log('Mapped products:', mappedProducts)) // Debug
    );
  }
  private mapProductPromotion(product: any): ProductWithPromotion {
    if (product.promotion) {
      const now = new Date();
      const startDate = new Date(product.promotion.startDate);
      const endDate = new Date(product.promotion.endDate);

      if (now >= startDate && now <= endDate) {
        const discountedPrice = product.price * (1 - product.promotion.discountPercentage / 100);
        return {
          ...product,
          activePromotion: product.promotion,
          promotionPrice: Number(discountedPrice.toFixed(2))
        };
      }
    }

    return {
      ...product,
      activePromotion: undefined,
      promotionPrice: product.price
    };
  }



  private isPromotionActive(promotion: any): boolean {
    if (!promotion) return false;
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate;
  }

  // product.service.ts
  private mapToProductWithPromotion(product: Product): ProductWithPromotion {
    if (product.promotion) {
      const discountedPrice = product.price * (1 - product.promotion.discountPercentage / 100);
      return {
        ...product,
        activePromotion: {
          id_promotion: product.promotion.id_promotion,
          description: product.promotion.description,
          discountPercentage: product.promotion.discountPercentage,
          startDate: product.promotion.startDate,
          endDate: product.promotion.endDate
        },
        promotionPrice: Number(discountedPrice.toFixed(2))
      };
    }

    return {
      ...product,
      activePromotion: undefined,
      promotionPrice: product.price
    };
  }
}

