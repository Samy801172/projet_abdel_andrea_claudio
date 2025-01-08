// src/app/components/PayPal/paypal-button.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PaypalService } from '../../services/paypal/paypal.service';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../services/notification/notification.service';
import {PaymentService} from '../../services/payement/payment.service';
import {CartService} from '../../services';

declare var paypal: any;

@Component({
  selector: 'app-paypal-button',
  standalone: true,
  template: `<div id="paypal-button-container"></div>`,
})
export class PaypalButtonComponent implements OnInit {
  @Input() amount: number = 0;

  constructor(
    private paymentService: PaymentService,
    private router: Router,
    private cartService: CartService,  // Ajouter cette injection
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    paypal.Buttons({
      createOrder: async () => {
        try {
          const response = await firstValueFrom(
            this.paymentService.createPaypalOrder(this.amount)
          );
          return response.id;
        } catch (error) {
          this.notificationService.error('Erreur lors de la création de la commande');
          throw error;
        }
      },
      onApprove: async (data: { orderID: string }) => {
        try {
          const captureResult = await firstValueFrom(
            this.paymentService.capturePaypalPayment(data.orderID)
          );
          await firstValueFrom(this.cartService.clearCart()); // Ajouter cette ligne
          this.notificationService.success('Paiement effectué avec succès !');
          await this.router.navigate(['/payment-success']);
        } catch (error) {
          this.notificationService.error('Erreur lors du paiement');
        }
      }
    }).render('#paypal-button-container');
  }
}
