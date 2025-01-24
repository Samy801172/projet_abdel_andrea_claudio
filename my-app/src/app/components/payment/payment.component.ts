import {Component, EventEmitter, Input, Output} from '@angular/core';
import {CurrencyPipe, NgIf} from '@angular/common';
import {RouterLink} from '@angular/router';
import {PaypalButtonComponent} from '../PayPal/paypal-button.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CurrencyPipe, PaypalButtonComponent, NgIf, RouterLink],
  templateUrl: 'payment.component.html',
  styleUrl: './payment.component.scss',
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
