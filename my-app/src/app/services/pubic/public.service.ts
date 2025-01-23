import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {catchError, map, tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root',
})
export class PublicService {
  private apiUrl = 'http://localhost:2024/api/public'; // L'URL de l'API publique

  constructor(private http: HttpClient) {}

  // Méthode pour récupérer le nombre total de commandes
  orderCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/order-count`);
  }

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

}
