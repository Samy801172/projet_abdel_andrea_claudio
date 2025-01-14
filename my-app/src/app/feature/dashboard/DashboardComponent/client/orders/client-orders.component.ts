// client-orders.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../../../../services';
import { NotificationService } from '../../../../../services/notification/notification.service';
import {Order, OrderDetail} from '../../../../../models/order/order.model';
import { AuthService } from '../../../../../services/auth/auth.service';
import {PromotionService} from '../../../../../services/promotion/promotion.service';
import {ProductWithPromotion} from '../../../../../models/product/product.model';

@Component({
  selector: 'app-client-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: 'client-orders.component.html',
  styleUrl: 'client-orders.component.scss'
})
export class ClientOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router,
    private promotionService: PromotionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;

    const clientId = this.getCurrentClientId();
    if (!clientId) {
      this.error = "Impossible de récupérer l'ID client";
      this.loading = false;
      return;
    }

    this.orderService.getOrdersByClientId(clientId).subscribe({
      next: (orders: Order[]) => {
        console.log('Orders received:', orders);
        // Pour chaque commande, afficher les détails des prix
        orders.forEach(order => {
          console.log(`Order #${order.id_order}:`);
          order.orderDetails?.forEach(detail => {
            console.log(`  Product: ${detail.product.name}`);
            console.log(`  Unit price saved: ${detail.unit_price}`);
            console.log(`  Original price: ${detail.product.price}`);
          });
        });
        this.orders = this.sortOrdersByDate(orders);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.error = "Erreur lors du chargement des commandes";
        this.loading = false;
      }
    });
  }

  private sortOrdersByDate(orders: Order[]): Order[] {
    return orders.sort((a, b) =>
      new Date(b.date_order).getTime() - new Date(a.date_order).getTime()
    );
  }

  private getCurrentClientId(): number | null {
    const clientIdStr = localStorage.getItem('clientId');
    if (!clientIdStr) {
      this.notificationService.error('Session expirée');
      this.router.navigate(['/login']);
      return null;
    }
    const clientId = parseInt(clientIdStr, 10);
    return isNaN(clientId) ? null : clientId;
  }

  getStatusLabel(statusId: number): string {
    const statusMap: { [key: number]: string } = {
      1: 'En attente',
      2: 'En cours de traitement',
      3: 'Expédié',
      4: 'Livré',
      5: 'Annulé'
    };
    return statusMap[statusId] || 'Statut inconnu';
  }

  getStatusClass(statusId: number): string {
    return `status status-${statusId}`;
  }

  viewOrderDetails(orderId: number): void {
    this.router.navigate(['/client/orders', orderId]);
  }
  hasPriceChanged(detail: OrderDetail): boolean {
    return detail.unit_price !== detail.product.price;
  }
}
