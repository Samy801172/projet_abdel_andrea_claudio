// services/client/client.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Appointment} from '../../models/Appointment/appointment.model';
import {Client} from '../../models/client/client.model';
import {Order} from '../../models/order/order.model';


@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly API_URL = 'http://localhost:2024/api/clients';

  constructor(private http: HttpClient) {}

  getClientProfile(): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/profile`);
  }

  updateProfile(clientId: number, data: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.API_URL}/${clientId}`, data);
  }

  getClientOrders(clientId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_URL}/${clientId}/orders`);
  }

  getClientAppointments(clientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API_URL}/${clientId}/appointments`);
  }
}
