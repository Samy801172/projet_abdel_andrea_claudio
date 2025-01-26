import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AppointmentsService } from '../../../../../services/appointment/appointment.service';
import { ServiceService } from '../../../../../services/Service/service.service';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import {AppointmentStatus} from "../../../../../models/Appointment/appointment-types";
import {Appointment} from "../../../../../models/Appointment/appointment.model";
import { NotificationService } from '../../../../../services/notification/notification.service';

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
    private serviceService: ServiceService,
    private notificationService: NotificationService,
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

  confirmCancel(appointment: Appointment): void {
    // Affiche une boîte de confirmation
    const confirmation = window.confirm('Êtes-vous sûr de vouloir annuler ce rendez-vous ?');

    if (confirmation) {
      // Action à effectuer si l'utilisateur confirme
      console.log('Rendez-vous annulé.');
      // @ts-ignore
      this.cancelAppointment(appointment);
    } else {
      // Action si l'utilisateur annule
      console.log('Annulation de rendez-vous annulée.');
    }
  }

// Fonction pour annuler le rendez-vous
  cancelAppointment(appointment: Appointment): void {
    const updatedAppointment: Appointment = {
      ...appointment,
      status: AppointmentStatus.Canceled,
    };
    this.appointmentService.update(appointment.appointmentId!, updatedAppointment).subscribe(() => {
      this.loadAppointments();
    });
  }


  generateTimeSlots(): void {
    const slots: string[] = [];
    const startHour = 10; // Heure de début : 10h
    const endHour = 16; // Heure de fin : 16h30

    // Générer les créneaux horaires
    for (let hour = startHour; hour <= endHour; hour++) {
      slots.push(`${hour}:00`, `${hour}:30`);
    }

    // Exclure les créneaux horaires déjà pris
    const selectedDate = this.appointmentForm.get('appointmentDate')?.value;

    if (selectedDate) {
      const takenSlots = this.appointments
        .filter((appointment) => appointment.appointmentDate === selectedDate)
        .map((appointment) => appointment.time);

      // Filtrer les créneaux disponibles
      this.availableTimeSlots = slots.filter((slot) => !takenSlots.includes(slot));
    } else {
      this.availableTimeSlots = slots; // Aucun créneau exclu si la date n'est pas sélectionnée
    }
  }


  submitAppointment(): void {
    if (!this.appointmentForm.valid) return;

    const formValue = this.appointmentForm.value;

    const appointmentData: Appointment = {
      appointmentId: this.editingAppointment?.appointmentId, // Assurez-vous d'inclure l'ID pour un update
      appointmentDate: this.appointmentForm.get('appointmentDate')?.value,
      time: this.appointmentForm.get('time')?.value,
      serviceId: Number(this.appointmentForm.get('serviceId')?.value), // Convertir en nombre
      clientId: Number(localStorage.getItem('clientId')), // Convertir en nombre
      status: 'en attente',
      note: this.appointmentForm.get('note')?.value || '', // Vérifiez si "note" est bien pris en compte
    };

    console.log('Données envoyées :', appointmentData);

    if (this.editingAppointment) {
      console.log(appointmentData.appointmentDate);
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
      this.generateTimeSlots();
    } else {
      this.notificationService.error('Date sélectionnée invalide ou non définie.');
      console.error('Date sélectionnée invalide ou non définie.');
    }
  }

  resetForm(): void {
    this.editingAppointment = null;
    this.appointmentForm.reset();
  }
}
