import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {ManufacturingRequest} from "../../models/manufacturing.model";

@Injectable({
  providedIn: 'root'
})
export class ManufacturingService {
  private apiUrl = `${environment.apiUrl}/manufacturing`;

  constructor(private http: HttpClient) {}

  createCustomManufacturing(manufacturingRequest: ManufacturingRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/custom`, manufacturingRequest);
  }


  capturePayment(manufacturingRequest: any, caca :any): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getManufacturingDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  processPayment(manufacturingId: number, paymentDetails: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${manufacturingId}/deposit/paypal`, paymentDetails);
  }


  getAvailableComponents(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  getAllManufacturing(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }


  validatePrescription(amount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order`, { amount });
  }

  updateManufacturingStatus(amount: number, id: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/create-order`, { amount });
  }
}
