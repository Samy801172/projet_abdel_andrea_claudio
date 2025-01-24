import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {Observable, pipe, throwError} from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';
import { Appointment } from '../../models/Appointment/appointment.model';
import { NotificationService } from '../notification/notification.service';

// Le décorateur @Injectable indique que ce service peut être injecté dans d'autres composants ou services
@Injectable({
  providedIn: 'root', // Fournit ce service à l'ensemble de l'application
})
export class AppointmentsService {
  // URL de base de l'API pour les rendez-vous
  private readonly apiUrl = 'http://localhost:2024/api/appointments';

  constructor(
    private http: HttpClient, // Service HTTP pour effectuer des requêtes à l'API
    private notificationService: NotificationService // Service de notification pour afficher des messages
  ) {}

  /**
   * Récupère tous les rendez-vous d'un client donné
   * @param id L'identifiant du client
   * @returns Un Observable contenant une liste de rendez-vous
   */
  getAll(id: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/${id}/myAppointments`).pipe(
      tap(() => console.log(`Récupération des rendez-vous pour le client ${id}`)),
      catchError((error) => {
        console.error(`Erreur lors de la récupération des rendez-vous :`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Crée un nouveau rendez-vous
   * @param appointment Les données du rendez-vous à créer
   * @returns Un Observable contenant le rendez-vous créé
   */
  create(appointment: Appointment): Observable<Appointment> {
    console.log(appointment.clientId, appointment.serviceId, appointment.clientId, appointment.clientId,)
    return this.http.post<Appointment>(`${this.apiUrl}/ajoutRendezVous`, appointment).pipe(
      tap(() => this.notificationService.success('Rendez-vous créé avec succès.')),
      catchError((error) => {
        console.error('Erreur lors de la création du rendez-vous :', error);
        this.notificationService.error('Ce rendez-vous est impossible, choisiez un autre');
        return throwError(() => error);
      })
    );
  }

  //méthode filtre pour filtrer les créneaux dispo
  getAppointmentsByDate(date: string): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`http://localhost:2024/api/appointments?date=${date}`);
  }

  /**
   * Met à jour un rendez-vous existant
   * @param appointmentId L'identifiant du rendez-vous à modifier
   * @param appointment Les nouvelles données du rendez-vous
   * @returns Un Observable contenant le rendez-vous mis à jour
   */
  update(appointmentId: number, appointment: Appointment): Observable<Appointment> {
    return this.http.put<Appointment>(
      `${this.apiUrl}/${appointmentId}/miseAjour`,
      appointment
    ).pipe(
      tap(() => console.log(`Rendez-vous ${appointmentId} mis à jour.`)),
      catchError((error) => {
        console.error(`Erreur lors de la mise à jour du rendez-vous ${appointmentId}:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Supprime un rendez-vous
   * @param id L'identifiant du rendez-vous à supprimer
   * @returns Un Observable vide
   */
  delete(id: number | undefined): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.notificationService.success('Rendez-vous annulé avec succès.')),
      catchError((error) => {
        console.error(`Erreur lors de l'annulation du rendez-vous ${id}:`, error);
        this.notificationService.error('Échec de l\'annulation du rendez-vous.');
        return throwError(() => error);
      })
    );
  }

  /**
   * Vérifie la disponibilité d'un créneau horaire
   * @param date La date du créneau à vérifier
   * @param time L'heure du créneau à vérifier
   * @returns Un Observable contenant un booléen indiquant si le créneau est disponible
   */
  checkAvailability(date: string, time: string): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/check-availability`, {
      params: { date, time },
    }).pipe(
      tap((available) => {
        if (available) {
          console.log(`Le créneau ${date} ${time} est disponible.`);
        } else {
          console.log(`Le créneau ${date} ${time} n'est pas disponible.`);
        }
      }),
      catchError((error) => {
        console.error('Erreur lors de la vérification de la disponibilité :', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Récupère les créneaux horaires disponibles pour une date donnée
   * @param date La date pour laquelle récupérer les créneaux
   * @returns Un Observable contenant une liste de créneaux horaires disponibles
   */
  getAvailableSlots(date: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/available-slots`, {
      params: { date },
    }).pipe(
      tap(() => console.log(`Créneaux disponibles pour la date ${date} récupérés.`)),
      catchError((error) => {
        console.error('Erreur lors de la récupération des créneaux disponibles :', error);
        return throwError(() => error);
      })
    );
  }


  /**
   * Récupère les rendez-vous d'un client spécifique
   * @param clientId L'identifiant du client
   * @returns Un Observable contenant une liste de rendez-vous
   */
  getAppointmentsByClient(clientId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/${clientId}/appointments`).pipe(
      tap(() => console.log(`Rendez-vous récupérés pour le client ${clientId}.`)),
      catchError((error) => {
        console.error(`Erreur lors de la récupération des rendez-vous pour le client ${clientId}:`, error);
        return throwError(() => error);
      })
    );
  }
}
export class AppointmentService {
}
