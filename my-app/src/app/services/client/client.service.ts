// services/client/client.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {Appointment} from '../../models/Appointment/appointment.model';
import {Client} from '../../models/client/client.model';
import {Order} from '../../models/order/order.model';
import {catchError, tap} from "rxjs/operators";


@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly API_URL = 'http://localhost:2024/api/clients';

  constructor(private http: HttpClient) {}


  getClientProfile(clientId: number): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/profile/${clientId}`); // Assure-toi que l'URL est correcte
  }

  getClients(): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/TousClients`); // Assure-toi que l'URL est correcte
  }

  // Mettre un client en Admin
  updateProfileToPutAdmin(clientId: number, updateData: { isAdmin: boolean }): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${clientId}/putAdmin`, updateData);
  }

  // Bannir un client
  updateBanClient(clientId: number, updateData: { ban: boolean }): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${clientId}/banClient`, updateData);
  }

  // pour l'upload de l'avatar
  uploadAvatar(clientId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file); // C'est ici !
    return this.http.post(`${this.API_URL}/profile/${clientId}/avatar`, formData);
  }

  // mise à jour de l'image
  updateProfile(clientId: number, updateData: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${clientId}/updateProfile`, updateData);
  }

  getClientOrders(clientId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_URL}/${clientId}/orders`);
  }

  getClientAppointments(clientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API_URL}/${clientId}/appointments`);
  }

  // pour supprimer un client
  deleteClient(clientId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${clientId}/delClient`).pipe(
      tap(() => console.log(`Client supprimé: ${clientId}`)),
      catchError(error => {
        console.error('Erreur lors de la suppression du client:', error);
        return throwError(() => error);
      })
    );
  }


}
