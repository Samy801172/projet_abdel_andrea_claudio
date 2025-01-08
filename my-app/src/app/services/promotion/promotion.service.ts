// services/promotion/promotion.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { NotificationService } from '../notification/notification.service';
import { Promotion, PromotionPayload } from '../../models/promotion/promotion.model';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {
  private readonly API_URL = 'http://localhost:2024/api/promotions';

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  getAllPromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(this.API_URL).pipe(
      catchError(error => {
        this.notificationService.error('Erreur lors du chargement des promotions');
        return throwError(() => error);
      })
    );
  }

  getActivePromotions(): Observable<Promotion[]> {
    return this.http.get<Promotion[]>(`${this.API_URL}/active`).pipe(
      catchError(error => {
        this.notificationService.error('Erreur lors du chargement des promotions actives');
        return throwError(() => error);
      })
    );
  }

  createPromotion(promotion: PromotionPayload): Observable<Promotion> {
    return this.http.post<Promotion>(this.API_URL, promotion).pipe(
      catchError(error => {
        this.notificationService.error('Erreur lors de la création de la promotion');
        return throwError(() => error);
      })
    );
  }

  updatePromotion(id: number, promotion: PromotionPayload): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.API_URL}/${id}`, promotion).pipe(
      catchError(error => {
        this.notificationService.error('Erreur lors de la mise à jour de la promotion');
        return throwError(() => error);
      })
    );
  }

  deletePromotion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`).pipe(
      catchError(error => {
        this.notificationService.error('Erreur lors de la suppression de la promotion');
        return throwError(() => error);
      })
    );
  }

  extendPromotion(id: number, newEndDate: string): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/extend`, { endDate: newEndDate }).pipe(
      catchError(error => {
        this.notificationService.error('Erreur lors de la prolongation de la promotion');
        return throwError(() => error);
      })
    );
  }

  deactivatePromotion(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API_URL}/${id}/deactivate`, {}).pipe(
      catchError(error => {
        this.notificationService.error('Erreur lors de la désactivation de la promotion');
        return throwError(() => error);
      })
    );
  }
}
