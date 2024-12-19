import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Product, ProductWithPromotion } from '../../models/product/product.model';
import { NotificationService } from '../notification/notification.service';

// Interface pour les éléments du panier
export interface CartItem {
  productId: number; // Identifiant du produit
  quantity: number; // Quantité ajoutée au panier
  product?: Product; // Détails du produit (facultatif)
}

@Injectable({
  providedIn: 'root' // Fournit le service au niveau racine de l'application
})
export class ProductService {
  // URL de l'API pour les produits
  private readonly API_URL = 'http://localhost:2024/api/products';

  // State pour gérer les articles du panier (Observable)
  private cartItems = new BehaviorSubject<CartItem[]>([]);

  constructor(
    private http: HttpClient, // Service HTTP pour les appels API
    private notificationService: NotificationService // Service pour les notifications
  ) {}

  /**
   * Créer un produit via une requête POST
   */
  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.API_URL, product).pipe(
      catchError(error => {
        this.notificationService.error('Erreur lors de la création du produit');
        return throwError(() => error);
      })
    );
  }

  /**
   * Mettre à jour un produit via son identifiant
   */
  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.API_URL}/${id}`, product).pipe(
      catchError(error => {
        this.notificationService.error('Erreur lors de la mise à jour du produit');
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprimer un produit via son identifiant
   */
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(error => {
        this.notificationService.error('Erreur lors de la suppression du produit');
        return throwError(() => error);
      })
    );
  }

  /**
   * Ajouter un produit au panier
   */
  addToCart(product: Product, quantity: number): Observable<void> {
    const cartItem: CartItem = {
      productId: product.id_product, // ID du produit
      product: product, // Détails du produit
      quantity: quantity // Quantité ajoutée
    };

    const currentCart = this.cartItems.value; // Récupérer l'état actuel du panier
    const existingItem = currentCart.find(item => item.productId === product.id_product);

    // Si le produit est déjà dans le panier, mettre à jour la quantité
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      currentCart.push(cartItem); // Sinon, ajouter le produit au panier
    }

    // Mettre à jour l'état du panier
    this.cartItems.next([...currentCart]);
    this.saveCartToLocalStorage();

    // Retourner un Observable complété
    return new Observable<void>(observer => {
      observer.next();
      observer.complete();
    });
  }

  /**
   * Sauvegarder le panier dans le localStorage
   */
  private saveCartToLocalStorage(): void {
    localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
  }

  /**
   * Ajouter un produit (via un endpoint spécifique)
   */
  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.API_URL}/add`, product);
  }

  /**
   * Retirer une promotion d'un produit
   */
  removePromotion(productId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${productId}/promotions`).pipe(
      catchError(error => {
        console.error('Erreur suppression promotion:', error);
        throw error;
      })
    );
  }

  /**
   * Appliquer une promotion à un produit
   */
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

  /**
   * Obtenir un produit par son identifiant
   */
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API_URL}/${id}`).pipe(
      map(product => ({
        ...product,
        imageUrls: product.imageUrls || [] // S'assurer que imageUrls est toujours un tableau
      })),
      catchError(error => {
        this.notificationService.error('Erreur lors du chargement du produit');
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupérer tous les produits avec les promotions actives
   */
  getAllProducts(): Observable<ProductWithPromotion[]> {
    return this.http.get<any[]>(this.API_URL).pipe(
      tap(rawProducts => console.log('Raw products:', rawProducts)), // Log pour débogage
      map(products => products.map(product => {
        console.log('Mapping product:', product); // Déboguer chaque produit

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
      tap(mappedProducts => console.log('Mapped products:', mappedProducts)) // Déboguer les produits mappés
    );
  }

  /**
   * Vérifier si une promotion est active
   */
  private isPromotionActive(promotion: any): boolean {
    if (!promotion) return false;
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate;
  }
}
