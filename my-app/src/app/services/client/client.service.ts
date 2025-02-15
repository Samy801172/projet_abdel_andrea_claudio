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
  private readonly API_URL = 'http://localhost:2024/api/clients'; // URL de l'API pour les clients

  constructor(private http: HttpClient) {}

  // Récupère le profil d'un client en fonction de son ID
  getClientProfile(clientId: number): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/profile/${clientId}`); // Assure-toi que l'URL est correcte
  }

  // Récupère la liste de tous les clients
  getClients(): Observable<Client> {
    return this.http.get<Client>(`${this.API_URL}/TousClients`); // Assure-toi que l'URL est correcte
  }

  // Met un client en tant qu'administrateur
  updateProfileToPutAdmin(clientId: number, updateData: { isAdmin: boolean }): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${clientId}/putAdmin`, updateData);
  }

  // Bannir un client
  updateBanClient(clientId: number, updateData: { ban: boolean }): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${clientId}/banClient`, updateData);
  }

  // Upload d'un avatar pour un client
  uploadAvatar(clientId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file); // Ajoute le fichier avatar
    return this.http.post(`${this.API_URL}/profile/${clientId}/avatar`, formData);
  }

  // Mise à jour du profil d'un client
  updateProfile(clientId: number, updateData: any): Observable<any> {
    return this.http.put<any>(`${this.API_URL}/${clientId}/updateProfile`, updateData);
  }

  // Récupère les commandes d'un client
  getClientOrders(clientId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API_URL}/${clientId}/orders`);
  }

  // Récupère les rendez-vous d'un client
  getClientAppointments(clientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API_URL}/${clientId}/appointments`);
  }

  // Désactive un client via un appel PATCH
  disableClient(clientId: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${clientId}/disable`, {}).pipe(
      tap(() => console.log(`Client désactivé: ${clientId}`)),
      catchError(error => {
        console.error('Erreur lors de la désactivation du client:', error);
        return throwError(() => error);
      })
    );
  }

  // Mise à jour des informations d'un client par l'admin
  updateClient(clientId: number, clientData: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.API_URL}/${clientId}/updateProfile`, clientData);
  }
}
