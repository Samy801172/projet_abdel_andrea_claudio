import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-manufacturing-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirmation-container">
      <h2>Confirmation de Paiement</h2>
      <div class="confirmation-content">
        <p>Votre acompte a été payé avec succès !</p>
        <p>Numéro de commande: #{{manufacturingId}}</p>
        <p>Nous allons commencer la fabrication de votre produit.</p>
        <p>Vous pouvez suivre l'avancement dans la section "Mes Fabrications".</p>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .confirmation-content {
      margin-top: 2rem;
      text-align: center;
    }
    h2 {
      color: #2c3e50;
      text-align: center;
    }
    p {
      margin: 1rem 0;
      line-height: 1.5;
    }
  `]
})
export class ManufacturingConfirmationComponent implements OnInit {
  manufacturingId: string = '';

  constructor(
    private route: ActivatedRoute,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.manufacturingId = this.route.snapshot.params['id'];
  }
} 