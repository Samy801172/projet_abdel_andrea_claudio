// feature/Dashboard/DashboardComponent/client/appointments/client-appointments.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-client-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-appointments.component.html',
  styleUrls: ['./client-appointments.component.scss']
})
export class ClientAppointmentsComponent implements OnInit {
  appointments: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadMyAppointments();
  }

  loadMyAppointments() {
    const userId = localStorage.getItem('userId');
    this.http.get(`http://localhost:2024/api/clients/${userId}/appointments`).subscribe({
      next: (data: any) => this.appointments = data,
      error: (error) => console.error('Erreur chargement rendez-vous:', error)
    });
  }
}
