// services/admin.service.ts
import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {Appointment} from '../../models/Appointment/appointment.model';
import {AppointmentStatus} from '../../models/Appointment/appointment-types';
import {Client} from '../../models/client/client.model';
import {map} from 'rxjs/operators';
import {Service} from '../../models/Service/service.model';


@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:2024/api'; // Ajustez selon votre configuration

  constructor(private http: HttpClient) {}

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

  updateAppointmentStatus(id: number, status: AppointmentStatus): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/appointments/${id}/status`, { status });
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
}
