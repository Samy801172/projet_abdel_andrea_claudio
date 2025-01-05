import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { NewOrder, Order } from '../../models/order/order.model';
import { NotificationService } from '../notification/notification.service';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly baseUrl = 'http://localhost:2024/api/orders';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}
  createOrder(newOrder: NewOrder): Observable<Order> {
    const headers = this.getAuthHeaders();

    return this.http.post<Order>(this.baseUrl, newOrder, { headers }).pipe(
      tap((response) => {
        this.notificationService.success('Commande créée avec succès');
      }),
      catchError((error: HttpErrorResponse) => {
        this.notificationService.error(
          error.error?.message || 'Erreur lors de la création de la commande'
        );
        return throwError(() => error);
      })
    );
  }
  // Méthode privée pour créer les headers avec token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('Pas de token trouvé');
      this.authService.logout();
      return new HttpHeaders();
    }
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  getAllOrders(): Observable<Order[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Order[]>(`${this.baseUrl}/admin/all`, { headers }).pipe(
      catchError(error => {
        console.error('Erreur de chargement des commandes:', error);
        return throwError(() => new Error('Impossible de charger les commandes'));
      })
    );
  }

  getOrdersByClientId(clientId: number): Observable<Order[]> {
    console.log(`Récupération des commandes pour le client ${clientId}`);
    const headers = this.getAuthHeaders();

    return this.http.get<Order[]>(`${this.baseUrl}/client/${clientId}`, { headers }).pipe(
      tap(orders => {
        console.log('Commandes client reçues:', orders);
      }),
      catchError(error => {
        console.error(`Erreur getOrdersByClientId pour ${clientId}:`, error);
        this.notificationService.error('Erreur lors du chargement des commandes');
        return throwError(() => error);
      })
    );
  }
  getOrderById(id: number): Observable<Order> {
    const headers = this.getAuthHeaders();
    const clientId = localStorage.getItem('clientId');

    if (!clientId) {
      this.notificationService.error('Session expirée');
      return throwError(() => new Error('ClientId non trouvé'));
    }

    return this.http.get<Order>(
      `${this.baseUrl}/${id}`,
      { headers }
    ).pipe(
      tap(order => {
        console.log('Commande reçue:', order);
        // Vérifier que l'utilisateur a accès à cette commande
        if (order.id_client.toString() !== clientId) {
          throw new Error('Accès non autorisé à cette commande');
        }
      }),
      catchError(error => {
        console.error('Erreur lors du chargement de la commande:', error);
        let message = 'Erreur lors du chargement de la commande';

        if (error.status === 401) {
          message = 'Session expirée, veuillez vous reconnecter';
          this.authService.logout();
        } else if (error.status === 403) {
          message = 'Accès non autorisé à cette commande';
        } else if (error.status === 404) {
          message = 'Commande non trouvée';
        }

        this.notificationService.error(message);
        return throwError(() => error);
      })
    );
  }


  updateOrderStatus(orderId: number, newStatus: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(
      `${this.baseUrl}/${orderId}/status`,
      { statusId: newStatus },
      { headers }
    ).pipe(
      catchError(error => {
        console.error('Erreur de mise à jour du statut:', error);
        return throwError(() => new Error('Impossible de mettre à jour le statut'));
      })
    );
  }

  deleteOrder(orderId: number): Observable<void> {
    console.log(`Suppression de la commande ${orderId}`);
    const headers = this.getAuthHeaders();

    return this.http.delete<void>(`${this.baseUrl}/${orderId}`, { headers }).pipe(
      tap(() => {
        console.log('Commande supprimée avec succès');
        this.notificationService.success('Commande supprimée avec succès');
      }),
      catchError(error => {
        console.error(`Erreur deleteOrder pour ${orderId}:`, error);
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

  private handleError(error: HttpErrorResponse): void {
    console.error('Erreur HTTP:', error);

    if (error.status === 401) {
      console.log('Erreur d\'authentification détectée');
      this.notificationService.error('Session expirée, veuillez vous reconnecter');
      this.authService.logout();
      return;
    }

    const errorMessage = error.error?.message || this.getErrorMessageByStatus(error.status);
    this.notificationService.error(errorMessage);
  }

  private getErrorMessageByStatus(status: number): string {
    const statusMessages: { [key: number]: string } = {
      400: 'Requête invalide',
      403: 'Accès non autorisé',
      404: 'Ressource non trouvée',
      500: 'Erreur serveur'
    };
    return statusMessages[status] || 'Une erreur est survenue';
  }
  updateOrder(orderId: number, updates: any): Observable<Order> {
    return this.http.put<Order>(
      `${this.baseUrl}/${orderId}`,
      updates,
      { headers: this.getAuthHeaders() }
    ).pipe(
      catchError(error => {
        this.handleError(error);
        return throwError(() => error);
      })
    );
  }

// order.service.ts
  cancelOrder(orderId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(
      `${this.baseUrl}/${orderId}/status`,
      { statusId: 5 }, // 5 est le statut CANCELLED
      { headers }
    ).pipe(
      tap(() => {
        this.notificationService.success('Commande annulée avec succès');
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors de l\'annulation de la commande');
        return throwError(() => error);
      })
    );
  }


  deleteOrderDetail(detailId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(
      `${this.baseUrl}/details/${detailId}`,
      {headers}
    ).pipe(
      tap(() => this.notificationService.success('Détail supprimé')),
      catchError(error => {
        this.notificationService.error('Erreur lors de la suppression');
        return throwError(() => error);
      })
    );
  }
  // src/services/order.service.ts
  updateOrderDetail(detailId: number, quantity: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.put(
      `${this.baseUrl}/details/${detailId}`,
      { quantity },
      { headers }
    ).pipe(
      tap(() => this.notificationService.success('Quantité mise à jour')),
      catchError(error => {
        this.notificationService.error('Erreur lors de la mise à jour de la quantité');
        return throwError(() => error);
      })
    );
  }

  createPaymentIntent(amount: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/payment/create`, { amount });
  }

  confirmPayment(orderId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/payment/confirm`, { orderId });
  }


}
