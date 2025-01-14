// orders/client-order-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, Routes} from '@angular/router';
import { OrderService } from '../../../../../services';
import { Order } from '../../../../../models/order/order.model';
import {ClientDashboardComponent} from '../client-dashboard.component';
import {ClientOrdersComponent} from './client-orders.component';
import {AuthGuard} from '../../../guard/auth.guard';
import { ClientService } from '../../../../../services';

@Component({
  selector: 'app-client-order-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './client-order-detail.component.html',
  styleUrl: './client-order-detail.component.scss',
})
export class ClientOrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = false;
  error: string | null = null;
  credential: string | null = localStorage.getItem("clientId"); // charge le clientId du client en question
  client: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService,
    private clientService: ClientService
  ) {}

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(+orderId);
      this.loadProfile();
    }
  }

  // charge le profile de l'utilisateur (Claudio)
  loadProfile(): void {
    if (this.credential == null) {
      console.warn('Credential non défini, impossible de charger le profil.');
      return;
    }
    this.clientService.getClientProfile(Number(this.credential)).subscribe({
      next: (data) => {
        this.client = data;
        console.log("l'id est : ", this.credential);
        console.log("l'adresse du client : ", this.client?.address || ' - Adresse non définie');
        console.log("Nom client : ", this.client?.lastName || ' - Nom non défini');
      },
      error: (error) => {
        console.error('Erreur chargement profil :', error);
      },
    });
  }

  //Charge les données de la commande par son orderId
  loadOrderDetails(orderId: number) {
    this.loading = true;
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.loading = false;
      },
      error: () => {
        this.error = "Impossible de charger les détails de la commande";
        this.loading = false;
      }
    });
  }

  getStatusClass(status: number): string {
    return `status status-${status}`;
  }

  getStatusLabel(status: number): string {
    const statusMap: { [key: number]: string } = {
      1: 'En attente',
      2: 'En cours de traitement',
      3: 'Expédié',
      4: 'Livré',
      5: 'Annulé'
    };
    return statusMap[status] || 'Statut inconnu';
  }

  goBack() {
    this.router.navigate(['/client/orders']);
  }
}

// client.routes.ts
export const clientRoutes: Routes = [
  {
    path: '',
    component: ClientDashboardComponent,
    children: [
      // ... autres routes existantes ...
      {
        path: 'orders',
        component: ClientOrdersComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Mes Commandes',
          requiresAuth: true
        }
      },
      {
        path: 'orders/:id',
        component: ClientOrderDetailComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Détail de la commande',
          requiresAuth: true
        }
      }
    ]
  }
];
