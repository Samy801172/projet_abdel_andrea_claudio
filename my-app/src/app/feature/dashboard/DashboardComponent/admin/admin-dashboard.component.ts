import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { AppointmentService } from '../../../../services/appointment/appointment.service';
import { AdminService } from '../../../../services/admin/admin.service';
import { Appointment } from '../../../../models/Appointment/appointment.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: 'admin-dashboard.component.html',
  styleUrls: ['admin-dashboard.component.scss'] // Corrigé : 'styleUrls' au lieu de 'styleUrl'
})
export class AdminDashboardComponent {
  appointments: Appointment[] = []; // Liste des rendez-vous

  constructor(
    private authService: AuthService,
    private router: Router,
    private appointmentService: AppointmentService,
    private adminService: AdminService// Injection du service pour récupérer les rendez-vous
  )

  {
    this.loadAppointments(); // Charger les rendez-vous au démarrage
  }

  ngOnInit(): void {
    // Charger les rendez-vous initialement
    this.loadAppointments();

    // Écouter les mises à jour des rendez-vous
    this.adminService.onAppointmentUpdated().subscribe(() => {
      this.loadAppointments(); // Recharge ou recalcule les rendez-vous
    });
  }

  // Déconnexion
  logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }

  // Charger les rendez-vous depuis le service
  loadAppointments(): void {
    this.adminService.getAllAppointments().subscribe((appointments) => {
      console.log('Rendez-vous chargés :', appointments);
      this.appointments = appointments;
    });
  }


  // Filtrer les rendez-vous par statut
  getAppointmentsByStatus(status: string): Appointment[] {
    return this.appointments.filter((appointment) => appointment.status === status);
  }
}
