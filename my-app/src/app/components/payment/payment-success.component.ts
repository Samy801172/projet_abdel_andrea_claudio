// src/app/components/payment/payment-success.component.ts
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {CartService} from '../../services';


@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="success-container">
      <div class="success-content">
        <div class="success-icon">✓</div>
        <h2>Paiement réussi !</h2>
        <p>Votre commande a été confirmée avec succès.</p>

        <div class="actions">
          <a routerLink="/client/orders" class="btn primary">Voir mes commandes</a>
          <a routerLink="/client/products" class="btn secondary">Retour aux produits</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .success-content {
      text-align: center;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      max-width: 500px;
      width: 100%;
    }

    .success-icon {
      font-size: 3rem;
      color: #22c55e;
      background: #dcfce7;
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    h2 {
      color: #1f2937;
      margin-bottom: 1rem;
      font-size: 1.5rem;
    }

    p {
      color: #6b7280;
      margin-bottom: 2rem;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 6px;
      font-weight: 500;
      text-decoration: none;
      transition: background-color 0.2s;
    }

    .primary {
      background: #4f46e5;
      color: white;
      &:hover {
        background: #4338ca;
      }
    }

    .secondary {
      border: 1px solid #4f46e5;
      color: #4f46e5;
      &:hover {
        background: #f3f4f6;
      }
    }

    @media (max-width: 640px) {
      .actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        text-align: center;
      }
    }
  `]
})
export class PaymentSuccessComponent implements OnInit {
  constructor(private cartService: CartService) {}

  ngOnInit() {
    // Vider le panier après un paiement réussi
    this.cartService.clearCart().subscribe({
      next: () => {
        console.log('Panier vidé avec succès');
      },
      error: (err) => {
        console.error('Erreur lors du vidage du panier:', err);
      }
    });
  }


}
