import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, throwError } from 'rxjs';
import { Appointment } from '../../models/Appointment/appointment.model';
import { AppointmentStatus } from '../../models/Appointment/appointment-types';
import { Client } from '../../models/client/client.model';
import { catchError, map, tap } from 'rxjs/operators';
import { Service } from '../../models/Service/service.model';
import { NotificationService } from '../notification/notification.service';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:2024/api'; // Ajustez selon votre configuration

  private appointmentUpdated = new Subject<void>(); // Notifie les changements de rendez-vous

  constructor(private http: HttpClient, private notificationService: NotificationService) { }

  // Observable pour écouter les notifications de mise à jour des rendez-vous
  onAppointmentUpdated(): Observable<void> {
    return this.appointmentUpdated.asObservable();
  }

  // Notifie une mise à jour des rendez-vous
    notifyAppointmentUpdated(): void {
    console.log('Notification de mise à jour des rendez-vous déclenchée');
    this.appointmentUpdated.next();
  }

  // Appointments
  getAllAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.apiUrl}/appointments`)
      .pipe(
        map(appointments => appointments.sort((a, b) =>
          new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime()
        ))
      );
  }

  getAppointmentById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.apiUrl}/appointments/${id}`);
  }

  createAppointment(data: Partial<Appointment>): Observable<Appointment> {
    return this.http.post<Appointment>(`${this.apiUrl}/appointments`, data);
  }

  updateAppointment(id: number, data: Partial<Appointment>): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.apiUrl}/appointments/${id}`, data);
  }

  updateAppointmentStatus(id: number | undefined, status: AppointmentStatus): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/appointments/${id}/changeStatus`, { status }).pipe(
      tap(() => this.notifyAppointmentUpdated()), // Notifie après mise à jour du statut
      catchError((error) => {
        console.error('Erreur lors de la mise à jour du statut :', error);
        return throwError(() => error);
      })
    );
  }

  // Clients
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`)
      .pipe(
        map(clients => clients.sort((a, b) =>
          a.lastName.localeCompare(b.lastName)
        ))
      );
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/clients/${id}`);
  }

  // Services
  getServices(): Observable<Service[]> {
    return this.http.get<Service[]>(`${this.apiUrl}/services`)
      .pipe(
        map(services => services.sort((a, b) =>
          a.name.localeCompare(b.name)
        ))
      );
  }

  getServiceById(id: number): Observable<Service> {
    return this.http.get<Service>(`${this.apiUrl}/services/${id}`);
  }

  // Méthodes utilitaires
  getAvailableTimeSlots(date: string, serviceId?: number): Observable<string[]> {
    let params = new HttpParams().set('date', date);
    if (serviceId) {
      params = params.set('serviceId', serviceId.toString());
    }
    return this.http.get<string[]>(`${this.apiUrl}/appointments/available-slots`, { params });
  }

  checkSlotAvailability(date: string, time: string, serviceId: number): Observable<boolean> {
    const params = new HttpParams()
      .set('date', date)
      .set('time', time)
      .set('serviceId', serviceId.toString());

    return this.http.get<boolean>(`${this.apiUrl}/appointments/check-availability`, { params });
  }

  // Statistiques (optionnel)
  getAppointmentStats(startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<any>(`${this.apiUrl}/appointments/stats`, { params });
  }

  // Admin delete
  deleteAdmin(appointmentId: number | undefined): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/appointments/${appointmentId}/deleteAdmin`).pipe(
      tap(() => this.notifyAppointmentUpdated()), // Notifie après suppression
      catchError((error) => {
        console.error('Erreur lors de la suppression :', error);
        return throwError(() => error);
      })
    );
  }

  // Confirmation du rendez-vous
  updateStatus(appointmentId: number | undefined, newStatus: string): Observable<Appointment> {
    console.log('Mise à jour du statut du rendez-vous avec ID :', appointmentId, 'Nouveau statut :', newStatus);

    return this.http.patch<Appointment>(`${this.apiUrl}/appointments/${appointmentId}/changeStatus`, { status: newStatus }).pipe(
      tap(() => {
        console.log('Statut mis à jour dans l\'API');
        this.notifyAppointmentUpdated();
      }),
      catchError((error) => {
        console.error('Erreur lors de la mise à jour du statut :', error);
        return throwError(() => error);
      })
    );
  }

}
