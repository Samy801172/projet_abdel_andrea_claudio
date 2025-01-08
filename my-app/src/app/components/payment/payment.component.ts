import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CurrencyPipe, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {PaypalButtonComponent} from '../PayPal/paypal-button.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CurrencyPipe, PaypalButtonComponent, NgIf, RouterLink],template: `
    <div class="payment-container">
      <h3>Paiement sécurisé</h3>
      <div class="amount">Total à payer: {{ amount | currency:'EUR' }}</div>

      <app-paypal-button [amount]="amount"></app-paypal-button>

      <div class="payment-buttons">
        <button class="payment-btn primary">Payer par Carte</button>
        <button class="payment-btn primary">Virement Bancaire</button>
        <button routerLink="/client/cart" class="payment-btn secondary">
          Retour au panier
        </button>
      </div>
    </div>
  `,
  styles: [`
    .payment-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 20px;
    }

    .payment-btn {
      width: 100%;
      padding: 12px;
      border-radius: 6px;
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .primary {
      background: #4f46e5;
      color: white;
    }

    .secondary {
      background: #6b7280;
      color: white;
    }
  `]
})
export class PaymentComponent {
  @Input() amount!: number;
  @Output() paymentSuccess = new EventEmitter<any>();

  simulatePayment(method: string) {
    setTimeout(() => {
      this.paymentSuccess.emit({
        method,
        transactionId: 'SIMU_' + Math.random().toString(36).substr(2, 9),
        status: 'COMPLETED'
      });
    }, 2000);
  }
}
