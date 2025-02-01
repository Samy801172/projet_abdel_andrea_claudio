import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../../../services';
import {Order, OrderDetail} from '../../../../../models/order/order.model';
import { NotificationService } from '../../../../../services/notification/notification.service';
import { PromotionService } from '../../../../../services/promotion/promotion.service';
import { Promotion } from '../../../../../models/promotion/promotion.model';

enum OrderStatus {
  Pending = 1,
  Processing = 2,
  Shipped = 3,
  Delivered = 4,
  Cancelled = 5
}

@Component({
  selector: 'app-admin-order-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'admin-orders.component.html',
  styleUrl: 'admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  // Propriétés existantes
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  newStatus: number | null = null;
  statusError: string | null = null;
  loading = false;
  error: string | null = null;
  processing = false;
  searchTerm: string = '';
  statusFilter: string = 'all';
  OrderStatus = OrderStatus; // Pour l'utiliser dans le template

  // Nouvelles propriétés pour les promotions
  availablePromotions: Promotion[] = [];
  selectedPromotion: Promotion | null = null;
  tempSelectedPromotion: Promotion | null = null; // Ajout de cette propriété
  originalTotal = 0; // Ajout de cette propriété

  @Output() orderUpdated = new EventEmitter<void>();

  // Statuts possibles
  orderStatuses = [
    {id_statut: OrderStatus.Pending, label: 'En attente'},
    {id_statut: OrderStatus.Processing, label: 'En cours de traitement'},
    {id_statut: OrderStatus.Shipped, label: 'Expédié'},
    {id_statut: OrderStatus.Delivered, label: 'Livré'},
    {id_statut: OrderStatus.Cancelled, label: 'Annulé'}
  ];

  private readonly validTransitions = {
    [OrderStatus.Pending]: [OrderStatus.Processing, OrderStatus.Cancelled],
    [OrderStatus.Processing]: [OrderStatus.Shipped, OrderStatus.Cancelled],
    [OrderStatus.Shipped]: [OrderStatus.Delivered, OrderStatus.Cancelled],
    [OrderStatus.Delivered]: [] as OrderStatus[],
    [OrderStatus.Cancelled]: [] as OrderStatus[]
  };

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {

  }

  ngOnInit() {
    this.loadOrders();

  }


  calculateDiscount(): number {
    if (!this.selectedPromotion || !this.selectedOrder) return 0;
    return (this.selectedOrder.montant_total * this.selectedPromotion.discountPercentage) / 100;
  }


  openModal(order: Order): void {
    this.selectedOrder = {...order};
    this.selectedPromotion = null;
  }



  cancelOrder(): void {
    if (!this.selectedOrder || !confirm('Êtes-vous sûr de vouloir annuler cette commande ?')) {
      return;
    }

    this.processing = true;
    this.orderService.updateOrderStatus(this.selectedOrder.id_order, 5).subscribe({
      next: () => {
        this.notificationService.success('Commande annulée avec succès');
        this.closeModal();
        this.loadOrders();
      },
      error: (error) => {
        console.error('Erreur annulation commande:', error);
        this.notificationService.error('Erreur lors de l\'annulation de la commande');
      },
      complete: () => {
        this.processing = false;
      }
    });
  }

// Ajoutez ces nouvelles méthodes


  removePromotion(): void {
    if (!this.selectedOrder) return;

    this.selectedOrder.montant_total = this.originalTotal;
    this.selectedPromotion = null;
    this.tempSelectedPromotion = null;
  }


  updateTotal(): void {
    if (!this.selectedOrder) return;

    this.originalTotal = this.selectedOrder.orderDetails.reduce(
      (total, detail) => total + (detail.quantity > 0 ? detail.quantity * detail.unit_price : 0),
      0
    );

    if (this.selectedPromotion) {
      const discountAmount = this.calculateDiscount();
      this.selectedOrder.montant_total = this.originalTotal - discountAmount;
    } else {
      this.selectedOrder.montant_total = this.originalTotal;
    }
  }


  saveChanges(): void {
    if (!this.selectedOrder) return;

    console.log('Selected Order:', this.selectedOrder);
    // Vérifiez que `id_client` est bien défini ici.

    this.processing = true;
    const updates = {
      orderDetails: this.selectedOrder.orderDetails,
      id_statut: this.selectedOrder.id_statut,
      promotionId: this.selectedPromotion?.id_promotion
    };

    this.orderService.updateOrder(this.selectedOrder.id_order, updates).subscribe({
      next: () => {
        this.notificationService.success('Commande mise à jour avec succès');
        this.closeModal();
        this.loadOrders();
      },
      error: (error) => {
        console.error('Erreur mise à jour commande:', error);
        this.notificationService.error('Erreur lors de la mise à jour de la commande');
      },
      complete: () => {
        this.processing = false;
      }
    });
  }

  getStatusClass(statusId: number): string {
    return `status status-${statusId}`;
  }

  getStatusLabel(statusId: number): string {
    const status = this.orderStatuses.find(s => s.id_statut === statusId);
    return status ? status.label : 'Inconnu';
  }

  loadOrders(): void {
    this.loading = true;
    this.error = null;
    this.orders = [];
    this.filteredOrders = []; // Ajout de cette ligne

    this.orderService.getAllOrders().subscribe({
      next: (orders) => {
        if (!orders) {
          this.error = 'Aucune commande trouvée';
          return;
        }
        this.orders = orders;
        this.filteredOrders = [...orders]; // Ajout de cette ligne
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement commandes:', error);
        this.error = 'Impossible de charger les commandes.';
        this.loading = false;
      }
    });
  }

  closeStatusModal(): void {
    this.selectedOrder = null;
    this.selectedPromotion = null; // Réinitialiser la promotion sélectionnée
    this.newStatus = null;
    this.statusError = null;
    this.processing = false;
  }

  getAvailableStatuses(order: Order | null): { id_statut: number; label: string }[] {
    if (!order) return [];

    const currentStatus = order.id_statut as OrderStatus;
    const availableTransitions = this.validTransitions[currentStatus] || [];

    return this.orderStatuses.filter(status =>
      availableTransitions.includes(status.id_statut as OrderStatus)
    );
  }

  updateOrderStatus(): void {
    if (!this.selectedOrder || !this.newStatus) {
      this.statusError = 'Veuillez sélectionner un nouveau statut.';
      return;
    }

    if (this.newStatus === this.selectedOrder.id_statut) {
      this.statusError = 'Le nouveau statut doit être différent de l\'ancien.';
      return;
    }

    if (!this.isValidTransition(this.selectedOrder.id_statut, this.newStatus)) {
      this.statusError = 'Cette transition de statut n\'est pas autorisée.';
      return;
    }

    this.processing = true;
    this.statusError = null;

    this.orderService.updateOrderStatus(this.selectedOrder.id_order, this.newStatus)
      .subscribe({
        next: () => {
          this.notificationService.success('Statut mis à jour avec succès');
          this.loadOrders();
          this.closeStatusModal();
          this.orderUpdated.emit();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du statut:', error);
          this.statusError = 'Erreur lors de la mise à jour du statut.';
          this.processing = false;
        }
      });
  }

  private isValidTransition(currentStatus: number, newStatus: number): boolean {
    if (currentStatus === newStatus) return false;

    const currentStatusEnum = currentStatus as OrderStatus;
    const validTransitions = this.validTransitions[currentStatusEnum];

    if (!validTransitions) return false;

    return validTransitions.includes(newStatus as OrderStatus);
  }

  applySelectedPromotion(): void {
    if (!this.tempSelectedPromotion || !this.selectedOrder) return;

    if (this.selectedPromotion) {
      this.removePromotion();
    }

    this.selectedPromotion = this.tempSelectedPromotion;
    const discountAmount = this.calculateDiscount();
    this.selectedOrder.montant_total = this.originalTotal - discountAmount;
    this.tempSelectedPromotion = null;
  }

  // Méthodes trackBy pour améliorer les performances
  trackByOrderId(index: number, order: Order): number {
    return order.id_order;
  }

  trackByOrderDetailId(index: number, detail: any): number {
    return detail.id_order_detail;
  }

  trackByPromotionId(index: number, promotion: Promotion): number {
    return promotion.id_promotion;  // Changé de 'id' à 'id_promotion'
  }

  trackByStatusId(index: number, status: { id_statut: number }): number {
    return status.id_statut;
  }

  removeProduct(detail: OrderDetail): void {
    if (!this.selectedOrder || !detail) {
      this.notificationService.error('Impossible de supprimer le produit : informations manquantes');
      return;
    }

    const detailId = detail.id_order_detail;
    if (!detailId) {
      this.notificationService.error('Impossible de supprimer le produit : identifiant manquant');
      return;
    }

    console.log('Suppression du produit avec id_order_detail:', detailId);

    this.processing = true;
    this.orderService.deleteOrderDetail(detailId).subscribe({
      next: () => {
        if (this.selectedOrder) {
          this.selectedOrder.orderDetails = this.selectedOrder.orderDetails.filter(
            d => d.id_order_detail !== detailId
          );
          this.updateTotal();
        }
        this.notificationService.success('Produit supprimé avec succès');
      },
      error: (error) => {
        console.error('Erreur lors de la suppression du produit:', error);
        this.notificationService.error('Erreur lors de la suppression du produit');
      },
      complete: () => {
        this.processing = false;
      }
    });
  }

  filterOrders(): void {
    this.filteredOrders = this.orders.filter(order => {
      // Filtre par texte
      const matchesSearch = !this.searchTerm ||
        order.id_order.toString().includes(this.searchTerm) ||
        order.client?.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        order.client?.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase());

      // Filtre par statut
      const matchesStatus = this.statusFilter === 'all' ||
        order.id_statut.toString() === this.statusFilter;

      return matchesSearch && matchesStatus;
    });
  }


  // Gestion des statuts
  getOrdersByStatus(status: OrderStatus): number {
    return this.orders.filter(order => order.id_statut === status).length;
  }

  validateAndUpdateQuantity(detail: OrderDetail): void {
    if (detail.quantity < 1) {
      detail.quantity = 1;
    }
    this.updateTotal();
  }

  updateQuantity(detail: OrderDetail, change: number): void {
    const newQty = detail.quantity + change;
    if (newQty >= 1) {
      detail.quantity = newQty;
      this.updateTotal();
    }
  }
  hasChanges(): boolean {
    if (!this.selectedOrder || !this.originalOrder) {
      return false;
    }

    const quantityChanged: boolean = this.selectedOrder.orderDetails.some(detail => {
      const original = this.originalOrder!.orderDetails.find(
        d => d.id_order_detail === detail.id_order_detail
      );
      return original ? original.quantity !== detail.quantity : false;
    });

    const statusChanged: boolean = Boolean(
      this.newStatus && this.newStatus !== this.originalOrder.id_statut
    );

    return quantityChanged || statusChanged;
  }

  closeModal(): void {
    if (this.hasChanges() && !confirm('Des modifications non sauvegardées seront perdues. Voulez-vous continuer ?')) {
      return;
    }
    this.closeStatusModal();
  }
  originalOrder: Order | null = null;

  openOrderDetails(order: Order): void {
    this.selectedOrder = {...order};
    this.originalOrder = {...order};
    this.newStatus = null;
    this.statusError = null;
  }
  }
