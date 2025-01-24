import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Appointment, AppointmentStatus } from '../../../../../models/Appointment/appointment.model';
import { NotificationService } from '../../../../../services/notification/notification.service';
import { AdminService } from '../../../../../services';
import { ServiceService } from '../../../../../services/Service/service.service';
import { ClientService } from '../../../../../services/client/client.service';
import { getStatusClass } from '../../../../../shared/enums/orderstatus.enum';

@Component({
  selector: 'app-admin-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: 'admin-appointments.component.html',
  styleUrl: 'admin-appointments.component.scss',
})
export class AdminAppointmentsComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = []; // Liste complète des rendez-vous
  filteredAppointments: Appointment[] = []; // Liste filtrée basée sur le statut ou autres critères
  private subscriptions: Subscription[] = []; // Gestion des abonnements
  services: ServiceService[] = [];
  client: ClientService[] = [];

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService,
    private serviceService: ServiceService,
  ) {}

  ngOnInit(): void {
    this.loadAppointments(); // Charger les rendez-vous au démarrage
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe()); // Nettoyage des abonnements
  }

  /**
   * Charge tous les rendez-vous depuis le backend.
   */
  private loadAppointments(): void {
    const sub = this.adminService.getAllAppointments().subscribe({
      next: (appointments: Appointment[]) => {
        this.filteredAppointments = appointments; // Initialiser avec tous les rendez-vous
        this.notificationService.success('Rendez-vous chargés avec succès');
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rendez-vous :', error);
        this.notificationService.error('Erreur lors du chargement des rendez-vous');
      },
    });

    this.subscriptions.push(sub);
  }

  // Met à jour le status d'un client depuis le panneau admin
  updateStatus(appointmentId: number | undefined, newStatus: AppointmentStatus): void {
    const sub = this.adminService.updateAppointmentStatus(appointmentId, newStatus).subscribe({
      next: () => {
        this.loadAppointments(); // Recharger les rendez-vous après mise à jour
        this.notificationService.success(`Statut mis à jour : ${this.getStatusLabel(newStatus)}`);
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut :', error);
        this.notificationService.error('Erreur lors de la mise à jour du statut');
      },
    });
    this.subscriptions.push(sub);
  }

  // Pour supprimer un rendez-vous d'un client depuis le panneau admin
  deleteAppointment(appointment: Appointment): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rendez-vous #${appointment.appointmentId} ?`)) {
      const sub = this.adminService.deleteAdmin(appointment.appointmentId).subscribe({
        next: () => {
          this.loadAppointments(); // Recharger les rendez-vous après suppression
          this.notificationService.success(`Rendez-vous #${appointment.appointmentId} supprimé avec succès`);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du rendez-vous :', error);
          this.notificationService.error('Erreur lors de la suppression du rendez-vous');
        },
      });
      this.subscriptions.push(sub);
    }
  }

  // Ceci sert à donner le status d'un rendez vous pour l'html pour le mettre dans la bonne section
  getAppointmentsByStatus(status: string): Appointment[] {
    return this.filteredAppointments.filter((appointment) => appointment.status === status);
  }


  // Retourne l'étiquette du status du rendez-vous
  getStatusLabel(status: string): string {
    const statusLabels: Record<AppointmentStatus, string> = {
      [AppointmentStatus.Pending]: 'En attente',
      [AppointmentStatus.Confirmed]: 'Confirmé',
      [AppointmentStatus.Canceled]: 'Annulé',
    };
      // @ts-ignore
    return statusLabels[status];
  }

  // Retourne la class css associé pour le status
  getStatusClass(status: string): string {
    return getStatusClass(status);
  }

  // Pour annuler un rendez-vous depuis le panneau admin
  cancelAppointment(appointment: Appointment): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler le rendez-vous #${appointment.appointmentId} ?`)) {
      this.updateStatus(appointment.appointmentId, AppointmentStatus.Canceled);
    }
  }

  // Confirmation du rendez-vous par l'admin
  confirmAppointment(appointment: Appointment): void {
    this.adminService.updateStatus(appointment.appointmentId, 'confirmé').subscribe(
      () => {
        console.log('Rendez-vous confirmé avec succès');
        appointment.status = 'confirmé'; // Mise à jour directe du statut
      },
      (error) => {
        console.error('Erreur lors de la confirmation du rendez-vous :', error);
      }
    );
  }







}
