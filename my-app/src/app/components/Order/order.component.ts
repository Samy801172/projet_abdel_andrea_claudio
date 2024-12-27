// components/order/order.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../services';
import { Order } from '../../models/order/order.model';
import { NotificationService } from '../../services/notification/notification.service';
import { AuthService } from '../../services/auth/auth.service';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css'],
})

export class OrderComponent implements OnInit {
  orders: Order[] = [];
  isAdmin: boolean = false;
  searchTerm: string = '';
  filterStatus: string = '';

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    this.isAdmin = this.authService.isAdmin();
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error) => {
        console.error('Erreur chargement commandes:', error);
        this.notificationService.error('Erreur lors du chargement des commandes');
      }
    });
  }

  get filteredOrders(): Order[] {
    return this.orders.filter(order => {
      const matchesSearch = !this.searchTerm ||
        order.orderId.toString().includes(this.searchTerm) ||
        order.orderDetails.some(detail =>
          detail.product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
        );

      const matchesStatus = !this.filterStatus || order.status === this.filterStatus;

      return matchesSearch && matchesStatus;
    });
  }

  calculateOrderTotal(order: Order): number {
    return order.orderDetails.reduce((total, detail) =>
      total + (detail.quantity * detail.unit_price), 0);
  }

  updateOrderStatus(orderId: number, newStatus: string): void {
    const updatedOrder = this.orders.find(o => o.orderId === orderId);
    if (!updatedOrder) return;

    this.orderService.updateOrder(orderId, {...updatedOrder, status: newStatus}).subscribe({
      next: () => {
        this.notificationService.success('Statut de la commande mis à jour');
        this.loadOrders();
      },
      error: (error) => {
        console.error('Erreur mise à jour statut:', error);
        this.notificationService.error('Erreur lors de la mise à jour du statut');
      }
    });
  }
}
