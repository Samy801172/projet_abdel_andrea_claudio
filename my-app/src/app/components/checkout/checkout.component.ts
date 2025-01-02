import { NotificationService } from '../../services/notification/notification.service';
import { Router } from '@angular/router';
import { CartItem } from '../../models/cart/cart-item.model';
import { Component, OnInit } from '@angular/core';
import { CartService, OrderService } from '../../services';
import { NewOrder } from '../../models/order/order.model';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './checkout.component.html',
  styles: [`
    .checkout-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
    }

    .order-summary {
      background: white;
      border-radius: 0.5rem;
      padding: 1.5rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .item {
      display: flex;
      justify-content: space-between;
      padding: 1rem 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .order-total {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 2px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 1.25rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .back-btn, .confirm-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 0.375rem;
      cursor: pointer;
    }

    .back-btn {
      background: #e5e7eb;
    }

    .confirm-btn {
      background: #059669;
      color: white;
    }

    .confirm-btn:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  total: number = 0;
  isProcessing = false;

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router,
    private authService: AuthService  // Ajout de l'AuthService
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
    // Vérifier le clientId
    if (!this.getCurrentClientId()) {
      this.notificationService.error('Problème avec vos informations de compte');
      this.router.navigate(['/login']);
    }
  }

  private getCurrentClientId(): number | null {
    try {
      const clientIdStr = localStorage.getItem('clientId');
      if (!clientIdStr) {
        console.error('ClientId non trouvé dans localStorage');
        return null;
      }
      const clientId = parseInt(clientIdStr, 10);
      if (isNaN(clientId)) {
        console.error('ClientId invalide:', clientIdStr);
        return null;
      }
      return clientId;
    } catch (error) {
      console.error('Erreur lors de la récupération du clientId:', error);
      return null;
    }
  }

  confirmOrder(): void {
    const clientId = this.getCurrentClientId();
    if (!clientId) {
      this.notificationService.error('Session expirée, veuillez vous reconnecter');
      this.router.navigate(['/login']);
      return;
    }

    this.isProcessing = true;

    const newOrder: NewOrder = {
      id_client: Number(clientId), // Assurez-vous que c'est un nombre
      id_statut: 1,
      date_order: new Date(),
      orderLines: this.cartItems.map(item => ({
        id_product: Number(item.product.id_product),
        quantity: Number(item.quantity),
        unit_price: typeof item.product.price === 'string'
          ? parseFloat(item.product.price)
          : item.product.price
      }))
    };

    console.log('Données de la commande:', newOrder); // Pour debug

    this.orderService.createOrder(newOrder).subscribe({
      next: (response) => {
        console.log('Commande créée:', response);
        this.notificationService.success('Commande créée avec succès');
        this.cartService.clearCart().subscribe({
          next: () => this.router.navigate(['/client/orders'])
        });
      },
      error: (error) => {
        console.error('Erreur création commande:', error);
        this.isProcessing = false;
        if (error.status === 401) {
          this.router.navigate(['/login']);
        }
        this.notificationService.error(
          error.error?.message || 'Erreur lors de la création de la commande'
        );
      }
    });
  }

  loadCartItems(): void {
    this.cartService.getCartItems().subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateTotal();
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement du panier');
        this.router.navigate(['/client/cart']);
      }
    });
  }

  calculateTotal(): void {
    this.total = this.cartItems.reduce(
      (sum, item) => sum + this.getPrice(item.product.price) * item.quantity,
      0
    );
  }

  backToCart(): void {
    this.router.navigate(['/client/cart']);
  }

  getItemTotal(item: CartItem): number {
    return this.getPrice(item.product.price) * item.quantity;
  }

  private getPrice(price: string | number): number {
    return typeof price === 'string' ? parseFloat(price) : price;
  }

  trackItem(index: number, item: CartItem): number {
    return item.id; // Assurez-vous que chaque article a un identifiant unique
  }
}
