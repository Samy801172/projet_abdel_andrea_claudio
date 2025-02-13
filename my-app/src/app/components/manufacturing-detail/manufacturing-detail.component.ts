import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ManufacturingService } from '../../services/manufacturing/manufacturing.service';
import { ManufacturingDetails } from '../../models/manufacturing/manufacturing.model';
import { NotificationService } from '../../services/notification/notification.service';
import { DepositPaymentComponent } from '../deposit-payment/deposit-payment.component';
import { AuthService } from '../../services/auth/auth.service';
import { ManufacturingStatusPipe } from '../../pipes/manufacturing-status.pipe';

@Component({
  selector: 'app-manufacturing-detail',
  templateUrl: './manufacturing-detail.component.html',
  styleUrls: ['./manufacturing-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, DepositPaymentComponent, ManufacturingStatusPipe]
})
export class ManufacturingDetailComponent implements OnInit {
  orderId: number = 0;
  details: ManufacturingDetails | null = null;
  loading = true;
  error = '';
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private manufacturingService: ManufacturingService,
    private notificationService: NotificationService,
    private router: Router,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.orderId = Number(id);
      this.loadDetails();
    } else {
      this.error = 'ID de commande non trouvé';
      this.notificationService.error(this.error);
    }
  }

  loadDetails() {
    this.loading = true;
    this.error = '';
    
    const token = this.authService.getToken();
    console.log('Composant - Token avant requête:', token ? 'Présent' : 'Absent');
    
    if (!token) {
      console.error('Composant - Pas de token disponible');
      this.error = 'Veuillez vous connecter';
      this.notificationService.error(this.error);
      this.router.navigate(['/login']);
      return;
    }

    this.manufacturingService.getManufacturingDetails(this.orderId)
      .subscribe({
        next: (response) => {
          console.log('Composant - Détails reçus:', response);
          this.details = response;
          this.loading = false;
        },
        error: (error) => {
          console.error('Composant - Erreur détaillée:', error);
          if (error.status === 401) {
            this.error = 'Session expirée, veuillez vous reconnecter';
            this.router.navigate(['/login']);
          } else {
            this.error = 'Erreur lors du chargement des détails de fabrication';
          }
          this.loading = false;
          this.notificationService.error(this.error);
        }
      });
  }

  getProgressPercentage(): number {
    if (!this.details) return 0;
    
    switch (this.details.status) {
      case 'EN_ATTENTE':
        return 25;
      case 'EN_FABRICATION':
        return 50;
      case 'TERMINE':
        return 75;
      case 'PRET_POUR_RETRAIT':
        return 100;
      default:
        return 0;
    }
  }

  updateStatus(newStatus: 'EN_ATTENTE' | 'EN_FABRICATION' | 'TERMINE' | 'PRET_POUR_RETRAIT') {
    if (!this.details) return;
    
    this.loading = true;
    this.manufacturingService.updateManufacturingStatus(this.orderId, newStatus)
      .subscribe({
        next: (response) => {
          this.details = response;
          this.loading = false;
          this.notificationService.success('Statut mis à jour avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du statut:', error);
          this.loading = false;
          this.notificationService.error('Erreur lors de la mise à jour du statut');
        }
      });
  }
} 