import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ManufacturingService } from '../../../../services/manufacturing/manufacturing.service';
import { PaypalService } from '../../../../services/paypal/paypal.service';

@Component({
  selector: 'app-manufacturing-payment',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="payment-container" *ngIf="manufacturingDetails">
      <h2>Paiement de l'acompte</h2>

      <div class="order-summary">
        <h3>Résumé de la commande</h3>
        <div class="details">
          <div class="detail-line">
            <span>Montant total:</span>
            <span>{{ manufacturingDetails.totalAmount | number:'1.2-2' }} €</span>
          </div>
          <div class="detail-line deposit">
            <span>Acompte à payer (30%):</span>
            <span>{{ manufacturingDetails.depositAmount | number:'1.2-2' }} €</span>
          </div>
        </div>
      </div>

      <div class="payment-methods">
        <h3>Choisissez votre méthode de paiement</h3>
        <div #paypalButtonsContainer></div>
      </div>
    </div>
  `,
  styles: [`
    .payment-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .order-summary {
      margin: 2rem 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;

      .details {
        margin-top: 1rem;
      }

      .detail-line {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;

        &.deposit {
          font-weight: bold;
          color: #0066cc;
          border-top: 1px solid #ddd;
          margin-top: 0.5rem;
          padding-top: 1rem;
        }
      }
    }

    .payment-methods {
      margin-top: 2rem;
    }
  `]
})
export class ManufacturingPaymentComponent implements OnInit {
  @ViewChild('paypalButtonsContainer', { static: true }) paypalButtonsContainer!: ElementRef;
  manufacturingDetails: any;
  manufacturingId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private manufacturingService: ManufacturingService,
    private paypalService: PaypalService
  ) {
    this.manufacturingId = parseInt(this.route.snapshot.params['id'], 10);
  }

  async ngOnInit() {
    try {
      this.manufacturingDetails = await this.manufacturingService
        .getManufacturingDetails(this.manufacturingId)
        .toPromise();

      await this.initPayPal();
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    }
  }

  private async initPayPal() {
    try {
      const paypalButtons = await this.paypalService.initPayPalButtons({
        amount: this.manufacturingDetails.depositAmount,
        onApprove: async (data: any, actions: any) => {
          try {
            const orderData = await actions.order.capture();

            await this.manufacturingService
              .capturePayment(this.manufacturingId, orderData.orderID)
              .toPromise();

            this.router.navigate(['/manufacturing', this.manufacturingId]);
          } catch (error) {
            console.error('Erreur lors du paiement:', error);
          }
        },
        onError: (err: any) => {
          console.error('Erreur PayPal:', err);
        }
      });

      if (this.paypalButtonsContainer.nativeElement.firstChild) {
        this.paypalButtonsContainer.nativeElement.innerHTML = '';
      }

      await paypalButtons.render(this.paypalButtonsContainer.nativeElement);
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de PayPal:', error);
    }
  }
}
