import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManufacturingService } from '../../services/manufacturing.service';
import { ManufacturingNotificationService } from '../../services/notification/manufacturing-notification.service';
import { Manufacturing } from '../../models/manufacturing/manufacturing.model';
import { DepositPaymentComponent } from '../deposit-payment/deposit-payment.component';
import { CustomMedicationOrder } from '../../models/payment/deposit.model';
import { DepositService } from '../../services/payment/deposit.service';
import { ActivatedRoute } from '@angular/router';
import { CustomMedicationService } from '../../services/custom-medication/custom-medication.service';

@Component({
  selector: 'app-manufacturing-tracking',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DepositPaymentComponent
  ],
  template: `
    <div class="tracking-container">
      <h2>Suivi de fabrication</h2>
      
      <div class="status-timeline">
        <!-- Étape 1: Commande reçue -->
        <div class="status-step" [class.active]="status !== 'pending'">
          <div class="step-icon">✓</div>
          <div class="step-content">
            <h3>Commande reçue</h3>
            <p>Votre commande a été validée et est en attente de fabrication</p>
          </div>
        </div>

        <!-- Étape 2: En préparation -->
        <div class="status-step" [class.active]="status === 'in_progress'">
          <div class="step-icon">🔧</div>
          <div class="step-content">
            <h3>En préparation</h3>
            <p>Votre médicament est en cours de fabrication</p>
          </div>
        </div>

        <!-- Étape 3: Contrôle qualité -->
        <div class="status-step" [class.active]="status === 'quality_check'">
          <div class="step-icon">🔍</div>
          <div class="step-content">
            <h3>Contrôle qualité</h3>
            <p>Vérification de la qualité du produit</p>
          </div>
        </div>

        <!-- Étape 4: Terminé -->
        <div class="status-step" [class.active]="status === 'completed'">
          <div class="step-icon">✨</div>
          <div class="step-content">
            <h3>Terminé</h3>
            <p>Votre médicament est prêt à être retiré</p>
          </div>
        </div>
      </div>

      <!-- Section paiement si nécessaire -->
      @if (!isPaid) {
        <div class="payment-required">
          <h3>Paiement requis</h3>
          <p>Le paiement est requis pour commencer la fabrication</p>
          <app-deposit-payment 
            [orderId]="orderId"
            [amount]="orderAmount">
          </app-deposit-payment>
        </div>
      }
    </div>
  `,
  styles: [`
    .tracking-container {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .timeline {
      position: relative;
      padding: 20px 0;
    }
    
    .timeline::before {
      content: '';
      position: absolute;
      left: 50px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: #ddd;
    }
    
    .timeline-item {
      display: flex;
      margin-bottom: 30px;
      opacity: 0.5;
    }
    
    .timeline-item.active {
      opacity: 1;
    }
    
    .timeline-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: #fff;
      border: 2px solid #ddd;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 20px;
    }
    
    .timeline-content {
      flex: 1;
    }
    
    .notes {
      margin-top: 30px;
      padding: 15px;
      background: #f9f9f9;
      border-radius: 8px;
    }

    .payment-required {
      background: #fff3cd;
      border: 1px solid #ffeeba;
      padding: 1.5rem;
      margin-bottom: 2rem;
      border-radius: 8px;
      text-align: center;

      h3 {
        color: #856404;
        margin-bottom: 1rem;
      }

      p {
        color: #856404;
        margin-bottom: 1.5rem;
      }
    }
  `]
})
export class ManufacturingTrackingComponent implements OnInit {
  @Input() orderId!: number;
  
  status: 'pending' | 'in_progress' | 'quality_check' | 'completed' = 'pending';
  isPaid = false;
  orderAmount = 0;
  
  constructor(
    private route: ActivatedRoute,
    private customMedicationService: CustomMedicationService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      this.loadManufacturingStatus();
    });
  }

  private loadManufacturingStatus() {
    this.customMedicationService.getManufacturingStatus(this.orderId)
      .subscribe(status => {
        this.status = status.status;
        this.isPaid = status.isPaid;
        this.orderAmount = status.amount;
      });
  }
} 