import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ManufacturingService } from '../../../services/manufacturing/manufacturing.service';
import { PaymentService } from '../../../services/payement/payment.service';
import { Manufacturing } from '../../../models/manufacturing/manufacturing.model';
import { PaypalButtonComponent } from '../../PayPal/paypal-button.component';
import { NotificationService } from '../../../services/notification/notification.service';
import { ManufacturingStatus } from '../../../models/manufacturing/manufacturing.model';
import { OrderService } from '../../../services/order/order.service';

@Component({
  selector: 'app-manufacturing-payment',
  standalone: true,
  imports: [CommonModule, PaypalButtonComponent],
  template: `
    <div class="payment-container">
      <h2>Paiement de l'Acompte</h2>

      <div class="order-details">
        <h3>Détails de la Commande #{{orderId}}</h3>
        @if (orderDetails) {
          <div class="details">
            <div class="detail-line">
              <span>Type:</span>
              <span>{{orderDetails.type}}</span>
            </div>
            <div class="detail-line">
              <span>Prix Total:</span>
              <span>{{orderDetails.totalPrice | currency:'EUR'}}</span>
            </div>
            <div class="detail-line total">
              <strong>Acompte (30%):</strong>
              <strong>{{orderDetails.deposit | currency:'EUR'}}</strong>
            </div>
          </div>

          <div class="payment-methods">
            <h3>Paiement Sécurisé</h3>

            <!-- Bouton PayPal -->
            <div class="paypal-container">
              <app-paypal-button
                [amount]="orderDetails.deposit || 0"
                [isDeposit]="true"
                [manufacturingRequestId]="orderId"
              ></app-paypal-button>
            </div>

            <!-- Bouton Carte -->
            <button class="btn card" (click)="payByCard()">
              <i class="fas fa-credit-card"></i> Payer par Carte
            </button>
          </div>
        } @else {
          <div class="loading">
            Chargement des détails...
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .detail-line {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #eee;
    }
    .total {
      margin-top: 1rem;
      border-top: 2px solid #ddd;
      border-bottom: none;
      font-size: 1.2em;
    }
    .payment-methods {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      align-items: center;
    }
    .paypal-container {
      width: 100%;
      max-width: 300px;
      margin: 1rem 0;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      width: 100%;
      max-width: 300px;
    }
    .card {
      background: #2c3e50;
      color: white;
    }
    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }
  `]
})
export class ManufacturingPaymentComponent implements OnInit {
  orderId: number;
  orderDetails: Manufacturing | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private manufacturingService: ManufacturingService,
    private notificationService: NotificationService,
    private orderService: OrderService
  ) {
    this.orderId = 0;
  }

  ngOnInit() {
    console.log('Component initialized');
    this.orderId = parseInt(this.route.snapshot.params['id']);
    this.loadOrderDetails();
  }

  async loadOrderDetails() {
    try {
      console.log('Loading order details for ID:', this.orderId);
      const response = await this.manufacturingService.getManufacturingDetails(this.orderId)
        .toPromise();
      if (response) {
        this.orderDetails = response;
        console.log('Order details loaded:', this.orderDetails);
      }
    } catch (error) {
      console.error('Error loading details:', error);
      this.notificationService.error('Erreur lors du chargement des détails');
    }
  }

  handlePaymentSuccess(paymentInfo: any) {
    const clientId = localStorage.getItem('clientId');
    if (!clientId) {
      this.notificationService.error('Session expirée');
      this.router.navigate(['/login']);
      return;
    }

    const orderData = {
      clientId: Number(clientId),
      orderLines: [{
        productId: this.orderDetails?.id || 0,
        quantity: 1
      }],
      payment: {
        method: 'PAYPAL',
        transactionId: paymentInfo.orderId || paymentInfo.id,
        status: 'COMPLETED',
        amount: this.orderDetails?.deposit || 0
      }
    };

    this.orderService.createManufacturingOrder(orderData).subscribe({
      next: (response) => {
        this.notificationService.success('Acompte payé avec succès !');
        this.router.navigate(['/manufacturing-confirmation', response.id_order]);
      },
      error: (error) => {
        console.error('Erreur paiement acompte:', error);
        this.notificationService.error('Erreur lors du paiement de l\'acompte');
      }
    });
  }

  payByCard() {
    this.notificationService.info('Paiement par carte bientôt disponible');
  }
}
