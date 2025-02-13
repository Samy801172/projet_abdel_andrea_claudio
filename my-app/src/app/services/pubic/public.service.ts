import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError, map, tap} from "rxjs/operators";
import {Order} from "../../models/order/order.model";

@Injectable({
  providedIn: 'root',
})
export class PublicService {
  private apiUrl = 'http://localhost:2024/api/public'; // L'URL de l'API publique

  constructor(private http: HttpClient) {}

  //////////////////////APPOINTMENT///////////////////////////////

  // Méthode pour récupérer le nombre de rendez-vous en attente
  appointmentsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/pending-count`).pipe(
      tap((response) => console.log('Réponse reçue du backend (frontend) :', response)),
      catchError((error) => {
        console.error('Erreur dans le service frontend :', error);
        throw error;
      })
    );
  }

  // Méthode pour récupérer le nombre de rendez-vous confirmés
  appointmentsCountConfirmed(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/confirmed-count`).pipe(
      tap((response) => console.log('Réponse reçue du backend (frontend) :', response)),
      catchError((error) => {
        console.error('Erreur dans le service frontend :', error);
        throw error;
      })
    );
  }

  // Méthode pour récupérer le nombre de rendez-vous annulé
  appointmentsCountCanceled(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/canceled-count`).pipe(
      tap((response) => console.log('Réponse reçue du backend (frontend) :', response)),
      catchError((error) => {
        console.error('Erreur dans le service frontend :', error);
        throw error;
      })
    );
  }

  ///////////////////////////ORDERS////////////////////////////////


  // Méthode pour récupérer le nombre total de commandes
  orderCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/orders-count`);
  }

  // Méthode pour récupérer le nombre de rendez-vous en attente
  ordersCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/orders-pending-count`).pipe(
      tap((response) => console.log('On a donc tout ça :', response)),
      catchError((error) => {
        console.error('Erreur dans le service frontend :', error);
        throw error;
      })
    );
  }

  // Méthode pour récupérer le nombre de d'ordonnance en attente
  ordonnanceCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/ordonnance-pending-count`).pipe(
      tap((response) => console.log('On a donc tout ça :', response)),
      catchError((error) => {
        console.error('Erreur dans le service frontend :', error);
        throw error;
      })
    );
  }

  // Méthode pour récupérer le nombre de rendez-vous confirmés
  ordersCountConfirmed(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/orders-confirmed-count`).pipe(
      tap((response) => console.log('Réponse reçue du backend (frontend) :', response)),
      catchError((error) => {
        console.error('Erreur dans le service frontend :', error);
        throw error;
      })
    );
  }

  // Méthode pour récupérer le nombre de rendez-vous annulé
  ordersCountCanceled(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/orders-canceled-count`).pipe(
      tap((response) => console.log('Réponse reçue du backend (frontend) :', response)),
      catchError((error) => {
        console.error('Erreur dans le service frontend :', error);
        throw error;
      })
    );
  }

}
