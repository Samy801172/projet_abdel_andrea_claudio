// src/app/services/paypal/paypal.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private readonly apiUrl = `${environment.apiUrl}/payments/paypal`;

  constructor(private http: HttpClient) {}

  createOrder(amount: number, orderId?: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, { amount, orderId })
      .pipe(
        catchError(error => {
          console.error('Error creating PayPal order:', error);
          return throwError(() => error);
        })
      );
  }

  capturePayment(orderId: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/capture/${orderId}`, {})
      .pipe(
        catchError(error => {
          console.error('Error capturing payment:', error);
          return throwError(() => error);
        })
      );
  }

  updatePaymentStatus(orderId: string, status: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/status/${orderId}`, { status })
      .pipe(
        catchError(error => {
          console.error('Error updating payment status:', error);
          return throwError(() => error);
        })
      );
  }
}
