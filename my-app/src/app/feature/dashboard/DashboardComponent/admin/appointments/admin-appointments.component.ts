import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Subscription } from 'rxjs';
import { Appointment } from '../../../../../models/Appointment/appointment.model';
import { Client } from '../../../../../models/client/client.model';
import { NotificationService } from '../../../../../services/notification/notification.service';

import { AppointmentStatus } from '../../../../../models/Appointment/appointment-types';
import { AdminService } from '../../../../../services';

// Ajout de l'interface Service si elle n'est pas déjà importée
interface Service {
  id: number;
  name: string;
  description?: string;
  duration: number;
  price: number;
}

interface AppointmentForm {
  clientId: number;
  serviceId: number;
  appointmentDate: string;
  time: string;
  notes: string;
}

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: 'admin-appointments.component.html',
  styleUrl: 'admin-appointments.component.scss'
})
export class AdminAppointmentsComponent implements OnInit, OnDestroy {
  // Propriétés
  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  statusFilter = '';
  dateFilter = '';
  searchQuery = '';
  showAddForm = false;
  editingAppointment: Appointment | null = null;
  appointmentForm!: FormGroup;
  clients: Client[] = [];
  services: Service[] = [];
  availableTimeSlots: string[] = [];
  minDate: string;
  private subscriptions: Subscription[] = [];

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    this.minDate = new Date().toISOString().split('T')[0];
    this.initForm();
    this.generateTimeSlots();
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadInitialData(): void {
    this.loadAppointments();
    this.loadClients();
    this.loadServices();
  }

  private setupFormListeners(): void {
    const dateControl = this.appointmentForm.get('appointmentDate');
    const serviceControl = this.appointmentForm.get('serviceId');

    if (dateControl) {
      this.subscriptions.push(
        dateControl.valueChanges.subscribe(() => {
          this.onDateChange();
        })
      );
    }

    if (serviceControl) {
      this.subscriptions.push(
        serviceControl.valueChanges.subscribe(() => {
          this.onServiceChange();
        })
      );
    }
  }

  private initForm(): void {
    this.appointmentForm = this.fb.group({
      clientId: ['', Validators.required],
      serviceId: ['', Validators.required],
      appointmentDate: ['', [Validators.required, this.dateValidator()]],
      time: ['', Validators.required],
      notes: ['']
    });
  }

  private dateValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        return { pastDate: true };
      }
      return null;
    };
  }

  private generateTimeSlots(): string[] {
    const slots: string[] = [];
    const startHour = 9;
    const endHour = 18;

    for (let hour = startHour; hour <= endHour; hour++) {
      const formattedHour = hour.toString().padStart(2, '0');
      slots.push(`${formattedHour}:00`);
      if (hour < endHour) {
        slots.push(`${formattedHour}:30`);
      }
    }
    return slots;
  }

  private getSlotDuration(serviceId: number): number {
    const service = this.services.find(s => s.id === serviceId);
    return service ? service.duration : 60; // Durée par défaut de 60 minutes
  }

  isTimeSlotAvailable(date: string, time: string): boolean {
    const dateTime = new Date(`${date}T${time}`);
    const now = new Date();
    const selectedServiceId = this.appointmentForm.get('serviceId')?.value;
    const duration = this.getSlotDuration(selectedServiceId);

    if (dateTime < now) {
      return false;
    }

    const endTime = new Date(dateTime);
    endTime.setMinutes(endTime.getMinutes() + duration);
    if (endTime.getHours() > 18) {
      return false;
    }

    return !this.appointments.some(appointment => {
      if (appointment.appointmentId === this.editingAppointment?.appointmentId) {
        return false;
      }

      const appointmentStart = new Date(`${appointment.appointmentDate}T${appointment.time}`);
      const appointmentEnd = new Date(appointmentStart);
      const appointmentDuration = this.getSlotDuration(appointment.serviceId);
      appointmentEnd.setMinutes(appointmentEnd.getMinutes() + appointmentDuration);

      const slotEnd = new Date(dateTime);
      slotEnd.setMinutes(slotEnd.getMinutes() + duration);

      return (dateTime < appointmentEnd && slotEnd > appointmentStart);
    });
  }

  onDateChange(): void {
    const selectedDate = this.appointmentForm.get('appointmentDate')?.value;
    if (selectedDate) {
      const allSlots = this.generateTimeSlots();
      this.availableTimeSlots = allSlots.filter(slot =>
        this.isTimeSlotAvailable(selectedDate, slot)
      );

      if (this.availableTimeSlots.length === 0) {
        this.notificationService.warning('Aucun créneau disponible pour cette date');
      }
    }
  }

  onServiceChange(): void {
    const serviceId = this.appointmentForm.get('serviceId')?.value;
    const service = this.services.find(s => s.id === serviceId);

    if (service) {
      this.onDateChange();
      if (service.duration > 60) {
        this.notificationService.info(`Ce service nécessite ${service.duration} minutes`);
      }
    }
  }

  editAppointment(appointment: Appointment): void {
    this.editingAppointment = appointment;
    const appointmentDate = new Date(appointment.appointmentDate)
      .toISOString()
      .split('T')[0];

    this.appointmentForm.patchValue({
      clientId: appointment.clientId,
      serviceId: appointment.serviceId,
      appointmentDate: appointmentDate,
      time: appointment.time,
      notes: appointment.notes || ''
    });

    this.onDateChange();
    this.showAddForm = true;
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.editingAppointment = null;
      this.appointmentForm.reset();
    } else {
      this.availableTimeSlots = this.generateTimeSlots();
    }
  }

  filterAppointments(): void {
    this.filteredAppointments = this.appointments.filter(appointment => {
      const matchesStatus = !this.statusFilter ||
        appointment.status.toLowerCase() === this.statusFilter.toLowerCase();

      const matchesDate = !this.dateFilter ||
        new Date(appointment.appointmentDate).toISOString().split('T')[0] === this.dateFilter;

      const matchesSearch = !this.searchQuery ||
        (appointment.client &&
          (`${appointment.client.firstName} ${appointment.client.lastName}`)
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase())
        );

      return matchesStatus && matchesDate && matchesSearch;
    });
  }

  private validateAppointmentData(data: Partial<Appointment>): boolean {
    const now = new Date();
    const appointmentDate = new Date(data.appointmentDate!);

    if (appointmentDate < now) {
      this.notificationService.error('La date du rendez-vous ne peut pas être dans le passé');
      return false;
    }

    if (!this.isTimeSlotAvailable(data.appointmentDate!.toString(), data.time!)) {
      this.notificationService.error('Ce créneau horaire n\'est plus disponible');
      return false;
    }

    const existingAppointment = this.appointments.find(a =>
      a.clientId === data.clientId &&
      new Date(a.appointmentDate).toDateString() === appointmentDate.toDateString() &&
      a.appointmentId !== this.editingAppointment?.appointmentId
    );

    if (existingAppointment) {
      this.notificationService.warning('Ce client a déjà un rendez-vous prévu ce jour');
      return false;
    }

    return true;
  }

  submitAppointment(): void {
    if (!this.appointmentForm.valid) {
      this.notificationService.error('Veuillez remplir tous les champs obligatoires');
      this.markFormGroupTouched(this.appointmentForm);
      return;
    }

    const formValue = this.appointmentForm.value;
    const appointmentData: Partial<Appointment> = {
      clientId: formValue.clientId,
      serviceId: formValue.serviceId,
      appointmentDate: new Date(`${formValue.appointmentDate}T${formValue.time}`),
      time: formValue.time,
      notes: formValue.notes || undefined,
      status: this.editingAppointment ? this.editingAppointment.status : AppointmentStatus.PENDING
    };

    if (this.validateAppointmentData(appointmentData)) {
      if (this.editingAppointment) {
        this.updateAppointment(this.editingAppointment.appointmentId, appointmentData);
      } else {
        this.createAppointment(appointmentData);
      }
    }
  }

  loadAppointments(): void {
    this.adminService.getAllAppointments().subscribe({
      next: (appointments: Appointment[]) => {
        this.appointments = appointments;
        this.filterAppointments();
        this.notificationService.success('Rendez-vous chargés avec succès');
      },
      error: (error: any) => {
        console.error('Erreur chargement rendez-vous:', error);
        this.notificationService.error('Erreur lors du chargement des rendez-vous');
      }
    });
  }

  loadClients(): void {
    this.adminService.getClients().subscribe({
      next: (clients: Client[]) => {
        this.clients = clients;
      },
      error: (error) => {
        console.error('Erreur chargement clients:', error);
        this.notificationService.error('Erreur lors du chargement des clients');
      }
    });
  }

  loadServices(): void {
    this.adminService.getServices().subscribe({
      next: (services: Service[]) => {
        this.services = services;
      },
      error: (error: any) => {
        console.error('Erreur chargement services:', error);
        this.notificationService.error('Erreur lors du chargement des services');
      }
    });
  }

  createAppointment(appointmentData: Partial<Appointment>): void {
    this.adminService.createAppointment(appointmentData).subscribe({
      next: (_: any) => {
        this.loadAppointments();
        this.toggleAddForm();
        this.notificationService.success('Rendez-vous créé avec succès');
        this.sendConfirmationEmail(appointmentData);
        console.log(appointmentData);
      },
      error: (error: Error) => {
        console.error('Erreur création rendez-vous:', error);
        this.notificationService.error('Erreur lors de la création du rendez-vous');
      }
    });
  }

  updateAppointment(id: number, appointmentData: Partial<Appointment>): void {
    this.adminService.updateAppointment(id, appointmentData).subscribe({
      next: (_: any) => {
        this.loadAppointments();
        this.toggleAddForm();
        this.notificationService.success('Rendez-vous mis à jour avec succès');
        this.sendUpdateNotification(appointmentData);
      },
      error: (error: Error) => {
        console.error('Erreur mise à jour rendez-vous:', error);
        this.notificationService.error('Erreur lors de la mise à jour du rendez-vous');
      }
    });
  }

  updateStatus(appointmentId: number, newStatus: AppointmentStatus): void {
    const appointment = this.appointments.find(a => a.appointmentId === appointmentId);
    if (!appointment) {
      this.notificationService.error('Rendez-vous non trouvé');
      return;
    }

    this.adminService.updateAppointmentStatus(appointmentId, newStatus).subscribe({
      next: (_: any) => {
        this.loadAppointments();
        this.notificationService.success(`Statut du rendez-vous mis à jour : ${newStatus}`);
        if (newStatus === AppointmentStatus.CONFIRMED) {
          this.sendConfirmationEmail(appointment);
        }
      },
      error: (error: any) => {
        console.error('Erreur mise à jour statut:', error);
        this.notificationService.error('Erreur lors de la mise à jour du statut');
      }
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private sendConfirmationEmail(appointment: Partial<Appointment>): void {
    const client = this.clients.find(c => c.clientId === appointment.clientId);
    if (client?.user?.email) {
      this.notificationService.success(`Un email de confirmation a été envoyé à ${client.user.email}`);
    }
  }

  private sendUpdateNotification(appointment: Partial<Appointment>): void {
    const client = this.clients.find(c => c.clientId === appointment.clientId);
    if (client?.user?.email) {
      this.notificationService.info(`Un email de mise à jour a été envoyé à ${client.user.email}`);
    }
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatTime(time: string): string {
    return time.padStart(5, '0');
  }

  getAllStatuses(): AppointmentStatus[] {
    return Object.values(AppointmentStatus);
  }

  getStatusLabel(status: AppointmentStatus): string {
    const statusLabels: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'En attente',
      [AppointmentStatus.CONFIRMED]: 'Confirmé',
      [AppointmentStatus.CANCELLED]: 'Annulé',
      [AppointmentStatus.COMPLETED]: 'Terminé',
      [AppointmentStatus.NOSHOW]: 'Non présenté'
    };
    return statusLabels[status] || status;
  }

  getServiceDuration(serviceId: number): string {
    const service = this.services.find(s => s.id === serviceId);
    if (!service) return '';
    const hours = Math.floor(service.duration / 60);
    const minutes = service.duration % 60;
    return hours > 0
      ? `${hours}h${minutes > 0 ? minutes : ''}`
      : `${minutes}min`;
  }

  getStatusClass(status: AppointmentStatus): string {
    const classes: Record<AppointmentStatus, string> = {
      [AppointmentStatus.PENDING]: 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full',
      [AppointmentStatus.CONFIRMED]: 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full',
      [AppointmentStatus.CANCELLED]: 'bg-red-100 text-red-800 px-2 py-1 rounded-full',
      [AppointmentStatus.COMPLETED]: 'bg-green-100 text-green-800 px-2 py-1 rounded-full',
      [AppointmentStatus.NOSHOW]: 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full'
    };
    return classes[status] || 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full';
  }

  canEditAppointment(appointment: Appointment): boolean {
    return appointment.status !== AppointmentStatus.CANCELLED &&
      appointment.status !== AppointmentStatus.COMPLETED &&
      new Date(appointment.appointmentDate) > new Date();
  }

  cancelAppointment(appointment: Appointment): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler ce rendez-vous avec ${appointment.client?.firstName} ${appointment.client?.lastName} ?`)) {
      this.updateStatus(appointment.appointmentId, AppointmentStatus.CANCELLED);
    }
  }

  protected readonly AppointmentStatus = AppointmentStatus;
}
