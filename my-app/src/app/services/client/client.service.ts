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


  getClientProfile(clientId: number): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/profile/${clientId}`); // Assure-toi que l'URL est correcte
  }

  updateProfile(clientId: number, updateData: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${clientId}/updateProfile`, updateData);
  }


  getClientOrders(clientId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_URL}/${clientId}/orders`);
  }

  getClientAppointments(clientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API_URL}/${clientId}/appointments`);
  }
}
