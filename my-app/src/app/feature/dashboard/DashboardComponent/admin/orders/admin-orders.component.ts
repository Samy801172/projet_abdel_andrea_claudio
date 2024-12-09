import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../../services';
import { Order, OrderDetail } from '../../../../../models/order/order.model';
import { NotificationService } from '../../../../../services/notification/notification.service';

enum OrderStatus {
  Pending = 1,
  Processing = 2,
  Shipped = 3,
  Delivered = 4,
  Cancelled = 5
}
interface OrderStatusType {
  id_statut: OrderStatus;
  label: string;
}
@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-container">
      <!-- En-tête avec statistiques -->
      <header class="page-header">
        <h1>Gestion des Commandes</h1>
        <div class="stats">
          <div class="stat-card">
            <span class="label">Total</span>
            <span class="value">{{orders.length}}</span>
          </div>
          <div class="stat-card">
            <span class="label">En cours</span>
            <span class="value">{{getOrdersByStatus(OrderStatus.Processing)}}</span>
          </div>
          <div class="stat-card">
            <span class="label">En attente</span>
            <span class="value">{{getOrdersByStatus(OrderStatus.Pending)}}</span>
          </div>
        </div>
      </header>

      <!-- Filtres -->
      <div class="filters">
        <input
          type="text"
          [(ngModel)]="searchTerm"
          (ngModelChange)="filterOrders()"
          placeholder="Rechercher une commande..."
          class="search-input"
        >
        <select
          [(ngModel)]="statusFilter"
          (change)="filterOrders()"
          class="status-select"
        >
          <option value="all">Tous les statuts</option>
          <option *ngFor="let status of orderStatuses" [value]="status.id_statut">
            {{status.label}}
          </option>
        </select>
      </div>

      <!-- Liste des commandes -->
      <div class="orders-list">
        <div *ngFor="let order of filteredOrders" class="order-card">
          <div class="order-header" (click)="toggleOrderDetails(order)">
            <div class="order-title">
              <h3>Commande #{{order.id_order}}</h3>
              <span class="date">{{order.date_order | date:'dd/MM/yyyy HH:mm'}}</span>
            </div>
            <div class="status-badge" [class]="getStatusClass(order.id_statut)">
              {{getStatusLabel(order.id_statut)}}
            </div>
          </div>

          <div class="order-details" [class.expanded]="selectedOrderId === order.id_order">
            <div class="products-list">
              <table>
                <thead>
                <tr>
                  <th>Produit</th>
                  <th>Quantité</th>
                  <th>Prix unitaire</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                <tr *ngFor="let detail of order.orderDetails">
                  <td>{{detail.product.name}}</td>
                  <td>
                    <div class="quantity-control">
                      <button (click)="updateQuantity(detail, -1)">-</button>
                      <input
                        type="number"
                        [(ngModel)]="detail.quantity"
                        min="1"
                        (change)="onQuantityChange($event, detail)"
                      >
                      <button (click)="updateQuantity(detail, 1)">+</button>
                    </div>
                  </td>
                  <td>{{detail.unit_price | currency:'EUR'}}</td>
                  <td>{{detail.quantity * detail.unit_price | currency:'EUR'}}</td>
                  <td>
                    <button
                      class="delete-btn"
                      (click)="removeOrderDetail(order.id_order, detail.id_order_detail)"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
                </tbody>
                <tfoot>
                <tr>
                  <td colspan="3" class="text-right">Total</td>
                  <td colspan="2">{{order.montant_total | currency:'EUR'}}</td>
                </tr>
                </tfoot>
              </table>
            </div>

            <div class="order-actions">
              <div class="status-update">
                <select [(ngModel)]="newStatuses[order.id_order]">
                  <option [ngValue]="null">Changer le statut</option>
                  <option *ngFor="let status of getAvailableStatuses(order)" [value]="status.id_statut">
                    {{status.label}}
                  </option>
                </select>
                <button
                  (click)="updateOrderStatus(order)"
                  [disabled]="!newStatuses[order.id_order]"
                  class="update-btn"
                >
                  Mettre à jour
                </button>
              </div>

              <button
                class="cancel-btn"
                (click)="cancelOrder(order)"
                [disabled]="!canCancel(order)"
              >
                Annuler la commande
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .orders-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);

      h1 {
        margin: 0;
        color: #0066CC;
        font-size: 1.8rem;
      }
    }

    .stats {
      display: flex;
      gap: 1rem;
    }

    .stat-card {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      min-width: 120px;
      text-align: center;

      .label {
        color: #6c757d;
        font-size: 0.9rem;
        display: block;
        margin-bottom: 0.5rem;
      }

      .value {
        color: #0066CC;
        font-size: 1.5rem;
        font-weight: bold;
      }
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;

      .search-input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        min-width: 250px;
      }

      .status-select {
        padding: 0.75rem;
        border: 1px solid #dee2e6;
        border-radius: 6px;
        min-width: 200px;
      }
    }

    .order-card {
      background: white;
      border-radius: 8px;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      overflow: hidden;

      .order-header {
        padding: 1.5rem;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: #f8f9fa;
        border-bottom: 1px solid #dee2e6;
        transition: background-color 0.2s;

        &:hover {
          background: #e9ecef;
        }
      }
    }

    .status-badge {
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;

      &.status-1 { background: #fff3cd; color: #856404; } // En attente
      &.status-2 { background: #cce5ff; color: #004085; } // En cours
      &.status-3 { background: #d4edda; color: #155724; } // Expédié
      &.status-4 { background: #d1e7dd; color: #0f5132; } // Livré
      &.status-5 { background: #f8d7da; color: #842029; } // Annulé
    }

    .order-details {
      padding: 0;
      max-height: 0;
      overflow: hidden;
      transition: all 0.3s ease-in-out;

      &.expanded {
        padding: 1.5rem;
        max-height: 1000px;
      }
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 1rem;

      th, td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #dee2e6;
      }

      th {
        background: #f8f9fa;
        font-weight: 600;
      }
    }

    .quantity-control {
      display: flex;
      align-items: center;
      gap: 0.5rem;

      input {
        width: 60px;
        text-align: center;
        padding: 0.25rem;
        border: 1px solid #dee2e6;
        border-radius: 4px;
      }

      button {
        width: 24px;
        height: 24px;
        padding: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border: none;
        background: #e9ecef;
        border-radius: 4px;
        cursor: pointer;

        &:hover {
          background: #dee2e6;
        }
      }
    }

    .order-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid #dee2e6;

      .status-update {
        display: flex;
        gap: 1rem;
        align-items: center;
      }

      button {
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s;

        &.update-btn {
          background: #0066CC;
          color: white;

          &:hover {
            background: #0052a3;
          }
        }

        &.cancel-btn {
          background: #dc3545;
          color: white;

          &:hover {
            background: #bb2d3b;
          }
        }

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }
    }

    .delete-btn {
      padding: 0.5rem;
      border: none;
      background: #dc3545;
      color: white;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background: #bb2d3b;
      }
    }
  `]
})
export class AdminOrdersComponent implements OnInit {
  // Propriétés de base
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrderId: number | null = null;
  searchTerm = '';
  statusFilter = 'all';
  newStatuses: { [key: number]: number } = {};
  loading = false;
  error: string | null = null;
  OrderStatus = OrderStatus; // Pour l'utiliser dans le template
  selectedOrder: Order | null = null;  // Ajout de cette propriété
  processing = false;  // Ajout de cette propriété

  orderStatuses = [
    { id_statut: OrderStatus.Pending, label: 'En attente' },
    { id_statut: OrderStatus.Processing, label: 'En cours' },
    { id_statut: OrderStatus.Shipped, label: 'Expédié' },
    { id_statut: OrderStatus.Delivered, label: 'Livré' },
    { id_statut: OrderStatus.Cancelled, label: 'Annulé' }
  ];


  private readonly validTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.Pending]: [OrderStatus.Processing, OrderStatus.Cancelled],
    [OrderStatus.Processing]: [OrderStatus.Shipped, OrderStatus.Cancelled],
    [OrderStatus.Shipped]: [OrderStatus.Delivered, OrderStatus.Cancelled],
    [OrderStatus.Delivered]: [],
    [OrderStatus.Cancelled]: []
  };
  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  // Méthodes de chargement et filtrage
  loadOrders(): void {
    this.loading = true;
    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
        this.filteredOrders = [...orders];
        this.filterOrders();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur de chargement:', error);
        this.error = 'Erreur lors du chargement des commandes';
        this.loading = false;
      }
    });
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => {
      const matchesSearch = !this.searchTerm ||
        order.id_order.toString().includes(this.searchTerm);

      const matchesStatus = this.statusFilter === 'all' ||
        order.id_statut.toString() === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }

  // Gestion des statuts
  getOrdersByStatus(status: OrderStatus): number {
    return this.orders.filter(order => order.id_statut === status).length;
  }

  getStatusClass(statusId: number): string {
    return `status-${statusId}`;
  }

  getStatusLabel(statusId: number): string {
    const status = this.orderStatuses.find(s => s.id_statut === statusId);
    return status?.label || 'Inconnu';
  }
  getAvailableStatuses(order: Order): OrderStatusType[] {
    const currentStatus = order.id_statut as OrderStatus;
    const allowedTransitions = this.validTransitions[currentStatus] || [];

    return this.orderStatuses.filter(status =>
      allowedTransitions.indexOf(status.id_statut) !== -1
    );
  }

  // Gestion des actions sur les commandes
  toggleOrderDetails(order: Order): void {
    this.selectedOrderId = this.selectedOrderId === order.id_order ? null : order.id_order;
  }

  updateQuantity(detail: OrderDetail, change: number): void {
    const newQuantity = detail.quantity + change;
    if (newQuantity < 1) return;

    detail.quantity = newQuantity;
    this.updateOrderTotal(detail.order_id);
  }

  onQuantityChange(event: Event, detail: OrderDetail): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = parseInt(input.value);

    if (isNaN(newQuantity) || newQuantity < 1) {
      input.value = '1';
      detail.quantity = 1;
    } else {
      detail.quantity = newQuantity;
    }

    this.updateOrderTotal(detail.order_id);
  }

  updateOrderTotal(orderId: number): void {
    const order = this.orders.find(o => o.id_order === orderId);
    if (!order) return;

    const total = order.orderDetails.reduce(
      (sum, detail) => sum + (detail.quantity * detail.unit_price),
      0
    );

    order.montant_total = total;
  }

  removeOrderDetail(orderId: number, detailId: number): void {
    if (!detailId) {
      this.notificationService.error('Identifiant du détail manquant');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) return;

    this.orderService.deleteOrderDetail(detailId).subscribe({
      next: () => {
        const order = this.orders.find(o => o.id_order === orderId);
        if (order) {
          order.orderDetails = order.orderDetails.filter(d => d.id_order_detail !== detailId);
          this.updateOrderTotal(orderId);
        }
        this.notificationService.success('Produit supprimé avec succès');
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.notificationService.error('Erreur lors de la suppression');
      }
    });
  }


  updateOrderStatus(order: Order): void {
    const newStatus = this.newStatuses[order.id_order];
    if (newStatus === undefined) return;

    this.orderService.updateOrderStatus(order.id_order, newStatus).subscribe({
      next: () => {
        order.id_statut = newStatus;
        delete this.newStatuses[order.id_order];
        this.notificationService.success('Statut mis à jour');
      },
      error: (error) => {
        console.error('Erreur:', error);
        this.notificationService.error('Erreur lors de la mise à jour du statut');
      }
    });
  }

  canCancel(order: Order): boolean {
    return order.id_statut !== OrderStatus.Delivered &&
      order.id_statut !== OrderStatus.Cancelled;
  }

  cancelOrder(order: Order): void {
    if (!this.canCancel(order)) return;
    if (!confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) return;

    this.orderService.updateOrderStatus(order.id_order, OrderStatus.Cancelled)
      .subscribe({
        next: () => {
          order.id_statut = OrderStatus.Cancelled;
          this.notificationService.success('Commande annulée');
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.notificationService.error('Erreur lors de l\'annulation');
        }
      });
  }

  // Helpers
  trackByOrderId(_: number, order: Order): number {
    return order.id_order;
  }

  trackByDetailId(_: number, detail: OrderDetail): number {
    return detail.id_order_detail;
  }
  removeProduct(detail: OrderDetail): void {
    // Debug pour voir la structure du détail
    console.log('Detail à supprimer:', detail);

    // Modification de la vérification de l'ID
    if (!detail || detail.id_order_detail === undefined) {
      console.error('Détail de commande invalide:', detail);
      this.notificationService.error('Impossible de supprimer : ID du détail manquant');
      return;
    }

    // On vérifie aussi l'orderId qui est obligatoire selon votre interface
    if (!detail.id_order_detail) {
      console.error('OrderId manquant:', detail);
      this.notificationService.error('Erreur : ID de commande manquant');
      return;
    }

    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit de la commande ?')) {
      this.processing = true;

      // Utilisation de l'ID vérifié
      const detailId = detail.id_order_detail;

      this.orderService.deleteOrderDetail(detailId).subscribe({
        next: () => {
          if (this.selectedOrder) {
            // Mise à jour de la liste des détails
            this.selectedOrder.orderDetails = this.selectedOrder.orderDetails.filter(
              d => d.id_order_detail !== detailId
            );
            // Recalcul du total
            this.updateTotal();
            this.notificationService.success('Produit supprimé avec succès');
            this.loadOrders(); // Recharger les données
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.notificationService.error('Erreur lors de la suppression du produit');
        },
        complete: () => {
          this.processing = false;
        }
      });
    }
  }
  // Méthode mise à jour avec les types corrects
  updateTotal(): void {
    if (!this.selectedOrder) return;

    this.selectedOrder.montant_total = this.selectedOrder.orderDetails.reduce(
      (total: number, detail: OrderDetail) => total + (detail.quantity * detail.unit_price),
      0
    );
  }

  // Mettre à jour la méthode qui sélectionne une commande
  openOrderDetails(order: Order): void {
    this.selectedOrderId = order.id_order;
    this.selectedOrder = order;  // Mise à jour de selectedOrder
    this.newStatuses = {};
  }

  // Mettre à jour la méthode de fermeture
  closeOrderDetails(): void {
    this.selectedOrderId = null;
    this.selectedOrder = null;  // Réinitialisation de selectedOrder
    this.processing = false;
  }
}
