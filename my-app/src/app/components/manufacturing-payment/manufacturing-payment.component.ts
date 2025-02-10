import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ManufacturingService } from '../../services/manufacturing/manufacturing.service';
import { PaypalService } from '../../services/paypal/paypal.service';
import { CommonModule } from '@angular/common';

declare const paypal: any;

@Component({
  selector: 'app-manufacturing-payment',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Paiement de l'acompte pour la fabrication</h2>
      <div class="card">
        <div class="card-body">
          <p>Montant de l'acompte: {{depositAmount}} €</p>
          <div #paypalButtons></div>
        </div>
      </div>
    </div>
  `
})
export class ManufacturingPaymentComponent implements OnInit {
  @ViewChild('paypalButtons') paypalButtons!: ElementRef;
  manufacturingId: number = 0;
  depositAmount: number = 0;

  constructor(
    private manufacturingService: ManufacturingService,
    private paypalService: PaypalService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.manufacturingId = +this.route.snapshot.params['id'];
    this.loadManufacturingDetails();
  }

  private loadManufacturingDetails() {
    this.manufacturingService.getManufacturingDetails(this.manufacturingId)
      .subscribe(details => {
        this.depositAmount = details.depositAmount;
        this.initPayPalButton();
      });
  }

  private initPayPalButton() {
    paypal.Buttons({
      createOrder: () => {
        return this.paypalService.createOrder(this.depositAmount)
          .toPromise()
          .then(response => response.orderId);
      },
      onApprove: (data: any) => {
        return this.paypalService.capturePayment(data.orderID)
          .toPromise()
          .then(() => {
            return this.manufacturingService.processDeposit(
              this.manufacturingId, 
              { paypalOrderId: data.orderID }
            ).toPromise();
          })
          .then(() => {
            this.router.navigate(['/manufacturing', this.manufacturingId]);
          });
      }
    }).render(this.paypalButtons.nativeElement);
  }
} 