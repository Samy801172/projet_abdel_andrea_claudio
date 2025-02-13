import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ManufacturingDetails, Manufacturing, ManufacturingStatus } from '../../models/manufacturing/manufacturing.model';
import { ManufacturingResponse } from '../../models/manufacturing/manufacturing-request.model';
import { environment } from '../../../environments/environment';
import { catchError, tap, map } from 'rxjs/operators';
import { NotificationService } from '../notification/notification.service';
import { ManufacturingNotificationService } from '../manufacturing/manufacturing-notification.service';

@Injectable({
  providedIn: 'root'
})
export class ManufacturingService {
  private apiUrl = `${environment.apiUrl}/manufacturing`;

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService,
    private manufacturingNotificationService: ManufacturingNotificationService
  ) {}

  createManufacturingRequest(formData: FormData): Observable<ManufacturingResponse> {
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.getAuthToken()}`);

    // Prix total fixé à 50€
    const totalPrice = 50;
    // Acompte de 30%
    const deposit = totalPrice * 0.3; // 15€

    formData.append('totalPrice', totalPrice.toString());
    formData.append('deposit', deposit.toString());
    formData.append('status', ManufacturingStatus.EN_ATTENTE_ACOMPTE);

    const clientId = localStorage.getItem('clientId');
    if (clientId) {
      formData.append('clientId', clientId);
    }

    return this.http.post<ManufacturingResponse>(
      `${this.apiUrl}/request`,
      formData,
      { headers }
    ).pipe(
      tap(response => {
        console.log('Réponse du serveur:', response);
        this.notificationService.success('Demande envoyée avec succès');
      }),
      catchError(error => {
        console.error('Erreur détaillée:', error);
        this.notificationService.error('Erreur lors de l\'envoi de la demande');
        throw error;
      })
    );
  }

  getClientManufacturingItems(): Observable<Manufacturing[]> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getAuthToken()}`
    );

    return this.http.get<Manufacturing[]>(
      `${this.apiUrl}/orders/client`,
      { headers }
    ).pipe(
      map(items => items.map(item => ({
        ...item,
        statusText: this.getStatusText(item.status),
        statusClass: this.getStatusClass(item.status)
      }))),
      tap(items => console.log('Fabrications chargées:', items)),
      catchError(error => {
        console.error('Erreur chargement fabrications:', error);
        this.notificationService.error('Erreur lors du chargement des fabrications');
        return throwError(() => error);
      })
    );
  }

  private getStatusText(status: ManufacturingStatus): string {
    const statusMap = {
      'EN_ATTENTE_ACOMPTE': 'En attente d\'acompte',
      'ACOMPTE_PAYE': 'Acompte payé',
      'EN_FABRICATION': 'En fabrication',
      'PRET': 'Prêt',
      'TERMINE': 'Terminé'
    };
    return statusMap[status] || 'Inconnu';
  }

  private getStatusClass(status: ManufacturingStatus): string {
    const statusClassMap = {
      'EN_ATTENTE_ACOMPTE': 'status-pending',
      'ACOMPTE_PAYE': 'status-deposit',
      'EN_FABRICATION': 'status-progress',
      'PRET': 'status-ready',
      'TERMINE': 'status-completed'
    };
    return statusClassMap[status] || 'status-unknown';
  }

  getManufacturingDetails(id: number): Observable<ManufacturingDetails> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getAuthToken()}`
    );
    
    return this.http.get<ManufacturingDetails>(
      `${this.apiUrl}/orders/${id}`,
      { headers }
    ).pipe(
      tap(response => {
        console.log('Détails de fabrication:', response);
      })
    );
  }

  updateManufacturingStatus(id: number, status: ManufacturingStatus): Observable<Manufacturing> {
    const headers = this.getAuthHeaders();
    
    return this.http.put<Manufacturing>(
      `${this.apiUrl}/orders/${id}/status`,
      { status: status },
      { headers }
    ).pipe(
      tap((response) => {
        console.log('Statut mis à jour:', response);
        this.notificationService.success('Statut mis à jour avec succès');
      }),
      catchError(error => {
        console.error('Erreur mise à jour statut:', error);
        this.notificationService.error('Erreur lors de la mise à jour du statut');
        return throwError(() => error);
      })
    );
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    });
  }

  validatePrescription(id: number): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getAuthToken()}`
    );

    return this.http.post(
      `${this.apiUrl}/orders/${id}/validate-prescription`,
      {},
      { headers }
    ).pipe(
      tap(() => {
        this.notificationService.success('Ordonnance validée avec succès');
      }),
      catchError(error => {
        this.notificationService.error('Erreur lors de la validation de l\'ordonnance');
        throw error;
      })
    );
  }

  processDeposit(orderId: number, paymentMethod: string, paymentData: any): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getAuthToken()}`
    );

    return this.http.post(
      `${this.apiUrl}/orders/${orderId}/deposit`,
      {
        paymentMethod,
        paymentData,
        amount: this.calculateDepositAmount(paymentData.amount)
      },
      { headers }
    );
  }

  private calculateDepositAmount(totalAmount: number): number {
    return totalAmount * 0.3; // 30% d'acompte
  }

  private getAuthToken(): string {
    return localStorage.getItem('token') || '';
  }

  getPrescriptionFileUrl(filename: string): string {
    return `${environment.apiUrl}/uploads/prescriptions/${filename}`;
  }

  addNote(id: number, note: string): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getAuthToken()}`
    );

    return this.http.post(
      `${this.apiUrl}/orders/${id}/notes`,
      { note },
      { headers }
    ).pipe(
      tap(() => console.log('Note ajoutée avec succès')),
      catchError(error => {
        console.error('Erreur lors de l\'ajout de la note:', error);
        throw error;
      })
    );
  }

  updateEstimatedDate(id: number, date: Date): Observable<any> {
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${this.getAuthToken()}`
    );

    return this.http.put(
      `${this.apiUrl}/orders/${id}/estimated-date`,
      { estimatedCompletionDate: date },
      { headers }
    ).pipe(
      tap(() => console.log('Date estimée mise à jour')),
      catchError(error => {
        console.error('Erreur lors de la mise à jour de la date:', error);
        throw error;
      })
    );
  }

  getAllManufacturingItems(): Observable<Manufacturing[]> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');

    return this.http.get<Manufacturing[]>(`${this.apiUrl}/admin/orders`, { headers }).pipe(
      tap(items => {
        console.log('Fabrications chargées:', items);
      }),
      catchError(error => {
        console.error('Erreur lors du chargement des fabrications:', error);
        this.notificationService.error('Erreur lors du chargement des fabrications');
        return throwError(() => error);
      })
    );
  }
}