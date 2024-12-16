// components/payment/payment.component.ts
import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {OrderService} from '../../services';
import {NotificationService} from '../../services/notification/notification.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="payment-container">
      <h2>Finalisation de la commande</h2>

      <!-- Affichage du récapitulatif -->
      <div class="order-summary">
        <h3>Récapitulatif de votre commande</h3>
        <p>Total à payer : {{totalAmount | currency:'EUR'}}</p>
      </div>

      <!-- Choix du mode de paiement -->
      <div class="payment-methods">
        <h3>Choisissez votre mode de paiement</h3>
        <div class="payment-options">
          <button
            [class.selected]="selectedMethod === 'paypal'"
            (click)="selectMethod('paypal')"
          >
            <img src="assets/paypal-logo.png" alt="PayPal">
            PayPal
          </button>

          <button
            [class.selected]="selectedMethod === 'card'"
            (click)="selectMethod('card')"
          >
            <i class="fas fa-credit-card"></i>
            Carte bancaire
          </button>
        </div>
      </div>

      <!-- Formulaire de paiement -->
      <form *ngIf="selectedMethod" [formGroup]="paymentForm" (ngSubmit)="processPayment()">
        <ng-container *ngIf="selectedMethod === 'card'">
          <div class="form-group">
            <label>Numéro de carte</label>
            <input
              type="text"
              formControlName="cardNumber"
              placeholder="1234 5678 9012 3456"
            >
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Date d'expiration</label>
              <input
                type="text"
                formControlName="expiryDate"
                placeholder="MM/YY"
              >
            </div>
            <div class="form-group">
              <label>CVC</label>
              <input
                type="text"
                formControlName="cvc"
                placeholder="123"
              >
            </div>
          </div>
        </ng-container>

        <button
          type="submit"
          class="pay-button"
          [disabled]="processing || !paymentForm.valid"
        >
          {{ processing ? 'Traitement en cours...' : 'Payer maintenant' }}
        </button>
      </form>
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

    .order-summary {
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;
    }

    .payment-methods {
      margin-bottom: 2rem;
    }

    .payment-options {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .payment-options button {
      flex: 1;
      padding: 1rem;
      border: 1px solid #dee2e6;
      border-radius: 4px;
      background: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .payment-options button.selected {
      border-color: #0066CC;
      background: #f0f7ff;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #495057;
    }

    .form-group input {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #dee2e6;
      border-radius: 4px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
    }

    .pay-button {
      width: 100%;
      padding: 1rem;
      border: none;
      border-radius: 4px;
      background: #0066CC;
      color: white;
      font-weight: 500;
      cursor: pointer;

      &:disabled {
        background: #a0a0a0;
        cursor: not-allowed;
      }
    }
  `]
})
export class PaymentComponent implements OnInit {
  @Input() totalAmount!: number;
  selectedMethod: 'paypal' | 'card' | null = null;
  processing = false;

  paymentForm = this.fb.group({
    cardNumber: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    expiryDate: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/([0-9]{2})$/)]],
    cvc: ['', [Validators.required, Validators.pattern(/^\d{3}$/)]]
  });

  constructor(
    private fb: FormBuilder,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  selectMethod(method: 'paypal' | 'card') {
    this.selectedMethod = method;
  }

  async processPayment() {
    if (!this.paymentForm.valid) return;

    this.processing = true;

    try {
      // Simulation du traitement du paiement
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Création de la commande
      const orderId = await this.orderService.validatePayment({
        method: this.selectedMethod,
        amount: this.totalAmount
      }).toPromise();

      this.notificationService.success('Paiement effectué avec succès !');
      this.router.navigate(['/order-confirmation', orderId]);
    } catch (error) {
      this.notificationService.error('Erreur lors du paiement. Veuillez réessayer.');
      console.error('Erreur de paiement:', error);
    } finally {
      this.processing = false;
    }
  }
}
