import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AppointmentsService } from '../../../../../services/appointment/appointment.service';
import { ServiceService } from '../../../../../services/Service/service.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import {AppointmentStatus} from "../../../../../models/Appointment/appointment-types";
import {Appointment} from "../../../../../models/Appointment/appointment.model";

// Interface représentant un service
interface Service {
  id: number;
  name: string;
  duration: number;
}

@Component({
  selector: 'app-appointments',
  templateUrl: './client-appointments.component.html',
  styleUrls: ['./client-appointments.component.scss'],
  imports: [ReactiveFormsModule, DatePipe, CommonModule],
  standalone: true,
})
export class ClientAppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  services: Service[] = [];
  availableTimeSlots: string[] = [];
  appointmentForm: FormGroup;
  showAddForm: boolean = false;
  editingAppointment: Appointment | null = null;
  minDate: string = new Date().toISOString().split('T')[0];
  clientId: string | null = localStorage.getItem('clientId');

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentsService,
    private serviceService: ServiceService
  ) {
    this.appointmentForm = this.fb.group({
      serviceId: ['', Validators.required],
      appointmentDate: ['', Validators.required],
      time: ['', Validators.required],
      note: [''],
    });
  }

  ngOnInit(): void {
    this.loadAppointments();
    this.loadServices();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) this.resetForm();
    else this.generateTimeSlots();
  }

  loadAppointments(): void {
    const idClient = Number(this.clientId);
    if (isNaN(idClient)) {
      console.error('Client ID invalide :', this.clientId);
      return;
    }

    this.appointmentService.getAll(idClient).subscribe({
      next: (data: Appointment[]) => (this.appointments = data),
      error: (err) => console.error('Erreur lors du chargement des rendez-vous :', err),
    });
  }

  loadServices(): void {
    this.serviceService.getAllServices().subscribe((data: Service[]) => {
      this.services = data;
    });
  }

  generateTimeSlots(): void {
    const slots: string[] = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour}:00`, `${hour}:30`);
    }
    this.availableTimeSlots = slots;
  }

  submitAppointment(): void {
    if (!this.appointmentForm.valid) return;

    const formValue = this.appointmentForm.value;

    const appointmentData: Appointment = {
      appointmentId: formValue.appointmentId || null, // Assurez-vous d'inclure l'ID pour un update
      appointmentDate: this.appointmentForm.get('appointmentDate')?.value,
      time: this.appointmentForm.get('time')?.value,
      serviceId: Number(this.appointmentForm.get('serviceId')?.value), // Convertir en nombre
      clientId: Number(localStorage.getItem('clientId')), // Convertir en nombre
      status: 'en attente',
      note: this.appointmentForm.get('note')?.value || '', // Vérifiez si "note" est bien pris en compte
    };

    console.log('Données envoyées :', appointmentData);

    if (this.editingAppointment) {
      this.appointmentService.update(this.editingAppointment.appointmentId!, appointmentData).subscribe({
        next: () => {
          this.loadAppointments();
          this.resetForm();
        },
        error: (err) => console.error('Erreur lors de la modification du rendez-vous.', err),
      });
    } else {
      this.appointmentService.create(appointmentData).subscribe({
        next: () => {
          this.loadAppointments();
          this.toggleAddForm();
        },
        error: (err) => console.error('Erreur lors de la création du rendez-vous.', err),
      });
    }
  }


  editAppointment(appointment: Appointment): void {
    this.editingAppointment = appointment;
    this.appointmentForm.patchValue({
      serviceId: appointment.serviceId,
      appointmentDate: appointment.appointmentDate,
      time: appointment.time,
      note: appointment.note,
    });
    this.toggleAddForm();
  }

  onDateChange(): void {
    const selectedDate = this.appointmentForm.get('appointmentDate')?.value;
    if (selectedDate) {
      this.generateTimeSlots(); // Régénère les créneaux horaires disponibles pour la date sélectionnée
    } else {
      console.error('Date sélectionnée invalide ou non définie.');
    }
  }


  cancelAppointment(appointment: Appointment): void {
    const updatedAppointment: Appointment = {
      ...appointment,
      status: AppointmentStatus.Canceled,
    };
    this.appointmentService.update(appointment.appointmentId!, updatedAppointment).subscribe(() => {
      this.loadAppointments();
    });
  }

  resetForm(): void {
    this.editingAppointment = null;
    this.appointmentForm.reset();
  }
}
