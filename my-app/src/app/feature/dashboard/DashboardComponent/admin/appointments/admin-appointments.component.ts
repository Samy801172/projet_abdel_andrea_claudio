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
  selector: 'app-admin-appointments', // Sélecteur utilisé dans le HTML pour ce composant
  standalone: true, // Permet d'utiliser ce composant sans module Angular parent
  imports: [CommonModule], // Importation du module Angular de base pour le templating
  templateUrl: 'admin-appointments.component.html', // Fichier de template HTML associé
  styleUrl: 'admin-appointments.component.scss', // Fichier de styles associé
})
export class AdminAppointmentsComponent implements OnInit, OnDestroy {
  appointments: Appointment[] = []; // Liste complète des rendez-vous
  filteredAppointments: Appointment[] = []; // Liste filtrée selon le statut ou autre critère
  private subscriptions: Subscription[] = []; // Tableau pour stocker les abonnements aux observables
  services: ServiceService[] = []; // Liste des services disponibles
  client: ClientService[] = []; // Liste des clients

  constructor(
    private adminService: AdminService, // Service pour gérer les rendez-vous
    private notificationService: NotificationService, // Service pour afficher des notifications
    private serviceService: ServiceService, // Service lié aux services proposés
  ) {}

  ngOnInit(): void {
    this.loadAppointments(); // Charge les rendez-vous au chargement du composant
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe()); // Désabonnement de tous les abonnements pour éviter les fuites mémoire
  }

  /**
   * Charge tous les rendez-vous depuis le backend via AdminService.
   */
  private loadAppointments(): void {
    const sub = this.adminService.getAllAppointments().subscribe({
      next: (appointments: Appointment[]) => {
        this.filteredAppointments = appointments; // Stocke les rendez-vous dans une liste filtrée
        this.notificationService.success('Rendez-vous chargés avec succès'); // Affichage d'une notification de succès
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rendez-vous :', error); // Gestion des erreurs
        this.notificationService.error('Erreur lors du chargement des rendez-vous'); // Notification d'échec
      },
    });

    this.subscriptions.push(sub); // Ajoute l'abonnement pour un futur nettoyage
  }

  /**
   * Met à jour le statut d'un rendez-vous depuis le panneau admin.
   * @param appointmentId Identifiant du rendez-vous à modifier.
   * @param newStatus Nouveau statut du rendez-vous.
   */
  updateStatus(appointmentId: number | undefined, newStatus: AppointmentStatus): void {
    const sub = this.adminService.updateAppointmentStatus(appointmentId, newStatus).subscribe({
      next: () => {
        this.loadAppointments(); // Recharge la liste des rendez-vous après mise à jour
        this.notificationService.success(`Statut mis à jour : ${this.getStatusLabel(newStatus)}`); // Affichage de la mise à jour réussie
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut :', error);
        this.notificationService.error('Erreur lors de la mise à jour du statut');
      },
    });

    this.subscriptions.push(sub); // Ajoute l'abonnement à la liste pour le désabonnement ultérieur
  }


   //Supprime un rendez-vous depuis le panneau admin.
   //@param appointment Rendez-vous à supprimer.
  deleteAppointment(appointment: Appointment): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le rendez-vous #${appointment.appointmentId} ?`)) {
      const sub = this.adminService.deleteAdmin(appointment.appointmentId).subscribe({
        next: () => {
          this.loadAppointments(); // Recharge la liste après suppression
          this.notificationService.success(`Rendez-vous #${appointment.appointmentId} supprimé avec succès`);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du rendez-vous :', error);
          this.notificationService.error('Erreur lors de la suppression du rendez-vous');
        },
      });

      this.subscriptions.push(sub); // Ajoute l'abonnement pour un futur nettoyage
    }
  }


   //Filtre les rendez-vous en fonction de leur statut pour affichage dans l'interface.
   //@param status Statut des rendez-vous à récupérer.
   //@returns Liste filtrée des rendez-vous correspondant au statut donné.
  getAppointmentsByStatus(status: string): Appointment[] {
    return this.filteredAppointments.filter((appointment) => appointment.status === status);
  }


   //etourne l'étiquette textuelle associée à un statut de rendez-vous.
   //@param status Statut du rendez-vous.
   //@returns Libellé correspondant au statut.
  getStatusLabel(status: string): string {
    const statusLabels: Record<AppointmentStatus, string> = {
      [AppointmentStatus.Pending]: 'En attente',
      [AppointmentStatus.Confirmed]: 'Confirmé',
      [AppointmentStatus.Canceled]: 'Annulé',
    };

    // @ts-ignore (pour éviter une erreur TypeScript si le statut est inconnu)
    return statusLabels[status];
  }


   //Annule un rendez-vous en mettant à jour son statut en "Annulé".
   //@param appointment Rendez-vous à annuler.
  cancelAppointment(appointment: Appointment): void {
    if (confirm(`Êtes-vous sûr de vouloir annuler le rendez-vous #${appointment.appointmentId} ?`)) {
      this.updateStatus(appointment.appointmentId, AppointmentStatus.Canceled);
    }
  }

   //Confirme un rendez-vous en mettant à jour son statut en "Confirmé".
   //@param appointment Rendez-vous à confirmer.
  confirmAppointment(appointment: Appointment): void {
    this.adminService.updateStatus(appointment.appointmentId, 'confirmé').subscribe(
      () => {
        console.log('Rendez-vous confirmé avec succès');
        appointment.status = 'confirmé'; // Mise à jour du statut en local pour éviter un rechargement
      },
      (error) => {
        console.error('Erreur lors de la confirmation du rendez-vous :', error);
      }
    );
  }
}
