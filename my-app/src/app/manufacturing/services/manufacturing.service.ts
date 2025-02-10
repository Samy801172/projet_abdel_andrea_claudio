import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ManufacturingService {
  private apiUrl = `${environment.apiUrl}/manufacturing`;

  constructor(private http: HttpClient) {}

  createCustomManufacturing(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/custom`, formData);
  }

  getManufacturingDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  processPayment(manufacturingId: number, paymentDetails: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${manufacturingId}/deposit/paypal`, paymentDetails);
  }
} 