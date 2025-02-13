import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-4">
      <div class="alert alert-warning">
        <h4>Paiement annulé</h4>
        <p>Le paiement a été annulé. Vous pouvez réessayer ou revenir plus tard.</p>
        <button class="btn btn-primary mt-3" (click)="retryPayment()">
          Réessayer le paiement
        </button>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 1rem;
    }
    .alert-warning {
      background-color: #fff3cd;
      border: 1px solid #ffeeba;
      border-radius: 4px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .btn-primary {
      background-color: #0066cc;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class PaymentCancelComponent {
  constructor(private router: Router) {}

  retryPayment() {
    // Retour à la page de paiement avec les paramètres de l'URL actuelle
    const currentUrl = this.router.url;
    const manufacturingId = new URLSearchParams(currentUrl.split('?')[1]).get('manufacturingId');
    const amount = new URLSearchParams(currentUrl.split('?')[1]).get('amount');

    this.router.navigate(['/manufacturing/payment'], {
      queryParams: {
        manufacturingId,
        amount
      }
    });
  }
} 