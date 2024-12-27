// components/appointment/appointment.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AppointmentsService } from '../../services/appointment/appointment.service';
import { Appointment } from '../../models/Appointment/appointment.model';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl:'./appointment.component.html',
  styleUrls: ['./appointment.component.css']
})

export class AppointmentComponent implements OnInit {
  appointments: Appointment[] = [];

  constructor(private appointmentService: AppointmentsService) {}
// pour initialiser le composant on utilse la methode ngOnInit()
  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.appointmentService.getAll().subscribe({
      next: (data: Appointment[]) => {
        this.appointments = data;
      },
      error: (error) => {
        console.error('Erreur chargement rendez-vous:', error);
      }
    });
  }
}
