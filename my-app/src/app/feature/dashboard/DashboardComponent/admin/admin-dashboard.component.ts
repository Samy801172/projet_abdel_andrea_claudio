import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { AppointmentService } from '../../../../services/appointment/appointment.service';
import { AdminService } from '../../../../services';
import { PublicService } from '../../../../services/pubic/public.service';
import { Appointment } from '../../../../models/Appointment/appointment.model';
import { Order } from '../../../../models/order/order.model'; // Import du modèle de commande

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: 'admin-dashboard.component.html',
  styleUrls: ['admin-dashboard.component.scss'] // Corrigé : 'styleUrls' au lieu de 'styleUrl'
})
export class AdminDashboardComponent implements OnInit {

  appointments: Appointment[] = []; // Liste des rendez-vous pour pouvoir utiliser le badge
  orders: Order[] = []; // Liste des commandes
  pendingOrders: number = 0;
  pendingAppointments: number = 0;
  pendingOrdonnances: number = 0;


  constructor(
    private authService: AuthService,
    private router: Router,
    private appointmentService: AppointmentService,
    private adminService: AdminService, // Injection du service pour récupérer les rendez-vous
    private publicService: PublicService // Injection du service pour récupérer les rendez-vous
  ) {}

  ngOnInit(): void {
    this.LoadAppointmentsNotConfirmed(); // Charger les rendez-vous au démarrage
    this.LoadOrdersNotConfirmed(); // Charger les commandes au démarrage
    this.LoadOrdonnanceNotConfirmed();
    console.log(this.orders);


    // Écouter les mises à jour des commandes pour mettre à jour la pastille badge
    this.adminService.onOrdersUpdated().subscribe(() => {
      this.LoadOrdersNotConfirmed(); // Recharge ou recalcule les commandes badges
    // Écouter les mises à jour des rendez-vous pour mettre à jour la pastille badge
    this.adminService.onAppointmentUpdated().subscribe(() => {
      this.LoadAppointmentsNotConfirmed(); // Recharge ou recalcule les rendez-vous

      // Écouter les mises à jour des ordonannces pour mettre à jour la pastille badge
      this.adminService.onOrdonnanceUpdated().subscribe(() => {
        this.LoadOrdonnanceNotConfirmed(); // Recharge ou recalcule les ordonnances badges

      });

    });

    });
  }

  // Déconnexion
  logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }


  // Charge le nombre de rendez-vous non confirmés via le service public
  LoadAppointmentsNotConfirmed(): void {
    this.publicService.appointmentsCount().subscribe({
      next: (count: number) => {
        console.log('Nombre total de rendez vous non confirmé:', count);
        this.pendingAppointments = count;
        console.log("Merde !  il y a exactement ", this.pendingAppointments, " rendez-vous !");
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rendez-vous en attente :', error);
      },
    });
  }

  // Charge le nombre de commandes non confirmés via le service public
  LoadOrdersNotConfirmed(): void {
    this.publicService.ordersCount().subscribe({
      next: (count: number) => {
        this.pendingOrders = count ?? 0; // Assure qu'on ne stocke pas undefined
        console.log('Nombre total de commande non confirméssssss:', this.pendingOrders);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des rendez-vous en attente :', error);
      },
    });
  }

  // Charge le nombre de commandes non confirmés via le service public
  LoadOrdonnanceNotConfirmed(): void {
    this.publicService.ordonnanceCount().subscribe({
      next: (count: number) => {
        this.pendingOrdonnances = count ?? 0; // Assure qu'on ne stocke pas undefined
        console.log('Nombre total de ordonnance non confirmés:', this.pendingOrdonnances);
      },
      error: (error) => {
        console.error('Erreur lors du chargement des ordonnances :', error);
      },
    });
  }

}
