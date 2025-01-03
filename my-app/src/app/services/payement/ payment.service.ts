// src/app/services/payment/payment.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {CartService} from '../cart/cart.service';
import {ProductService} from '../product/product.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private readonly apiUrl = `${environment.apiUrl}/payments`;

  constructor(
    private http: HttpClient,
    private cartService: CartService,
    private productService: ProductService
  ) {}



  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }
  createPaypalOrder(amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/paypal/create`, {
      amount,
      clientId: Number(localStorage.getItem('clientId'))
    }, { headers: this.getAuthHeaders() });
  }

  capturePaypalPayment(orderId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/paypal/capture/${orderId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }
}
