import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  createPayPalOrder(manufacturingId?: string): Observable<any> {
    const clientId = localStorage.getItem('clientId');
    if (!clientId) {
      return throwError(() => new Error('Non autorisé'));
    }

    const payload = {
      //amount: Number(amount.toFixed(2)),
      clientId: Number(clientId),
      manufacturingId,
      currency: 'EUR',
      isManufacturing: !!manufacturingId
    };

    return this.http.post(
      `${this.apiUrl}/payments/paypal/create`,
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('Ordre PayPal créé:', response)),
      catchError(error => {
        console.error('Erreur création commande PayPal:', error);
        return throwError(() => error);
      })
    );
  }

  capturePayPalOrder(paypalOrderId: string, manufacturingId: number): Observable<any> {
    const clientId = localStorage.getItem('clientId');
    if (!clientId) {
      return throwError(() => new Error('Non autorisé'));
    }

    const payload = {
      paypalOrderId,
      clientId: Number(clientId),
      manufacturingId,
      status: 'COMPLETED',
      isManufacturing: !!manufacturingId
    };

    return this.http.post(
      `${this.apiUrl}/payments/paypal/capture/${paypalOrderId}`,
      payload,
      { headers: this.getHeaders() }
    ).pipe(
      tap(response => console.log('Capture PayPal réussie:', response)),
      catchError(error => {
        console.error('Erreur capture PayPal:', error);
        return throwError(() => error);
      })
    );
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
}
