// src/app/services/paypal/paypal.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { loadScript } from '@paypal/paypal-js';

@Injectable({
  providedIn: 'root'
})
export class PaypalService {
  private apiUrl = `${environment.apiUrl}${environment.endpoints.paypal}`;
  private paypalInstance: any;

  constructor(private http: HttpClient) {}

  async initPayPalButtons(options: {
    amount: number;
    onApprove: (data: any, actions: any) => Promise<void>;
    onError?: (error: any) => void;
  }) {
    if (!this.paypalInstance) {
      this.paypalInstance = await loadScript({
        clientId: environment.paypalClientId,
        currency: 'EUR',
        intent: 'capture'
      });
    }

    return this.paypalInstance.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'pay'
      },
      createOrder: (data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [{
            amount: {
              value: options.amount.toFixed(2),
              currency_code: 'EUR'
            },
            description: 'Acompte fabrication sur mesure'
          }]
        });
      },
      onApprove: options.onApprove,
      onError: options.onError || ((err: any) => console.error('Erreur PayPal:', err))
    });
  }

  createOrder(amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order`, { amount });
  }

  capturePayment(orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/capture-payment`, { orderId });
  }
}
