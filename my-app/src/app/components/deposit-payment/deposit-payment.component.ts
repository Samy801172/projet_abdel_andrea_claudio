import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ManufacturingService } from '../../services/manufacturing/manufacturing.service';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-deposit-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="deposit-container">
      <h2>Paiement de l'Acompte</h2>
      
      @if (loading) {
        <div class="loading">Chargement...</div>
      } @else {
        <div class="order-details">
          <h3>Détails de la Commande #{{orderId}}</h3>
          
          @if (manufacturingDetails) {
            <div class="details-grid">
              <div class="detail-item">
                <span class="label">Type:</span>
                <span class="value">{{manufacturingDetails.type}}</span>
              </div>
              <div class="detail-item">
                <span class="label">Prix Total:</span>
                <span class="value">{{manufacturingDetails.totalAmount}}€</span>
              </div>
              <div class="detail-item">
                <span class="label">Acompte (30%):</span>
                <span class="value highlight">{{manufacturingDetails.depositAmount}}€</span>
              </div>
            </div>

            <div class="payment-section">
              <h4>Paiement Sécurisé</h4>
              <div class="payment-methods">
                <button class="payment-btn" (click)="payWithCard()">
                  Payer par Carte
                </button>
                <button class="payment-btn paypal" (click)="payWithPaypal()">
                  PayPal
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .deposit-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    h2 {
      color: #2c3e50;
      margin-bottom: 2rem;
      text-align: center;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #666;
    }

    .details-grid {
      display: grid;
      gap: 1rem;
      margin: 1.5rem 0;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      border-bottom: 1px solid #eee;

      .label {
        color: #666;
      }

      .value {
        font-weight: 500;
        
        &.highlight {
          color: #2c3e50;
          font-size: 1.1em;
          font-weight: 600;
        }
      }
    }

    .payment-section {
      margin-top: 2rem;
      text-align: center;

      h4 {
        margin-bottom: 1rem;
      }
    }

    .payment-methods {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .payment-btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 4px;
      background: #0066cc;
      color: white;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }

      &.paypal {
        background: #0070ba;
      }
    }
  `]
})
export class DepositPaymentComponent implements OnInit {
  orderId: number = 0;
  manufacturingDetails: any = null;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private manufacturingService: ManufacturingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      this.loadManufacturingDetails();
    });
  }

  loadManufacturingDetails() {
    this.manufacturingService.getManufacturingDetails(this.orderId).subscribe({
      next: (details) => {
        this.manufacturingDetails = details;
        this.loading = false;
      },
      error: () => {
        this.notificationService.error('Erreur lors du chargement des détails');
        this.loading = false;
      }
    });
  }

  payWithCard() {
    this.loading = true;
    const paymentData = {
      amount: this.manufacturingDetails.depositAmount,
      currency: 'EUR',
      orderId: this.orderId
    };

    this.manufacturingService.processDeposit(this.orderId, 'card', paymentData).subscribe({
      next: (response: any) => {
        this.notificationService.success('Paiement effectué avec succès');
        this.router.navigate(['/manufacturing/confirmation', this.orderId]);
      },
      error: (error: any) => {
        console.error('Erreur de paiement:', error);
        this.notificationService.error('Erreur lors du paiement');
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  payWithPaypal() {
    this.loading = true;
    const paymentData = {
      amount: this.manufacturingDetails.depositAmount,
      currency: 'EUR',
      orderId: this.orderId
    };

    this.manufacturingService.processDeposit(this.orderId, 'paypal', paymentData).subscribe({
      next: (response: { paypalUrl: string }) => {
        window.location.href = response.paypalUrl;
      },
      error: (error: Error) => {
        console.error('Erreur PayPal:', error);
        this.notificationService.error('Erreur lors de l\'initialisation du paiement PayPal');
        this.loading = false;
      }
    });
  }
} 