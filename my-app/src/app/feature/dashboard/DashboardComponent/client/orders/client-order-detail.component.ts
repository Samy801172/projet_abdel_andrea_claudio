// orders/client-order-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {ActivatedRoute, Router, Routes} from '@angular/router';
import { OrderService } from '../../../../../services';
import { Order } from '../../../../../models/order/order.model';
import {ClientDashboardComponent} from '../client-dashboard.component';
import {ClientOrdersComponent} from './client-orders.component';
import {AuthGuard} from '../../../guard/auth.guard';

@Component({
  selector: 'app-client-order-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="order-detail-container">
      @if (loading) {
        <div class="loading">Chargement des détails...</div>
      }

      @if (error) {
        <div class="error">{{ error }}</div>
      }

      @if (!loading && order) {
        <div class="order-detail-card">
          <div class="order-header">
            <div class="order-info">
              <h2>Commande #{{ order.id_order }}</h2>
              <span class="order-date">{{ order.date_order | date:'dd/MM/yyyy' }}</span>
            </div>
            <span class="status" [class]="getStatusClass(order.id_statut)">
              {{ getStatusLabel(order.id_statut) }}
            </span>
          </div>

          <div class="products-list">
            <h3>Produits commandés</h3>
            @for (detail of order.orderDetails; track detail.id_order_detail) {
              <div class="product-item">
                <div class="product-info">
                  <h4>{{ detail.product.name }}</h4>
                </div>
                <div class="product-details">
                  <div class="quantity">
                    Quantité: {{ detail.quantity }}
                  </div>
                  <div class="price-details">
                    <span class="unit-price">{{ detail.unit_price | currency:'EUR' }} / unité</span>
                    <span class="line-total">{{ detail.quantity * detail.unit_price | currency:'EUR' }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <div class="order-summary">
            <div class="total-section">
              <span>Total de la commande:</span>
              <span class="total-amount">{{ order.montant_total | currency:'EUR' }}</span>
            </div>
          </div>

          <div class="actions">
            <button class="back-btn" (click)="goBack()">Retour aux commandes</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .order-detail-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }

    .order-detail-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      padding: 24px;
    }

    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #eee;
    }

    .order-info h2 {
      margin: 0;
      color: #2d3748;
      font-size: 1.5rem;
    }

    .product-item {
      padding: 16px;
      border-bottom: 1px solid #eee;
    }

    .product-details {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 12px;
    }

    .price-details {
      text-align: right;
    }

    .status {
      padding: 6px 12px;
      border-radius: 15px;
      font-size: 0.9em;
    }

    .status-1 { background: #fff3cd; color: #856404; }
    .status-2 { background: #cce5ff; color: #004085; }
    .status-3 { background: #d4edda; color: #155724; }
    .status-4 { background: #d4edda; color: #155724; }
    .status-5 { background: #f8d7da; color: #721c24; }

    .back-btn {
      background: #4f46e5;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      cursor: pointer;
      margin-top: 20px;
    }
  `]
})
export class ClientOrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetails(+orderId);
    }
  }

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
