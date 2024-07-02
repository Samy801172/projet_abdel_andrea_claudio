
import { Component, OnInit } from '@angular/core';
import { SubscriptionService } from 'app/services/subscription.service';
import { FormsModule } from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-subscription',
  templateUrl: './subscription.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./subscription.component.scss']
})
export class SubscriptionComponent implements OnInit {
  successMessage: string = '';
  successDeleteMessage: string = '';

  subscriptions: any[] = [];

  constructor(private subscriptionService: SubscriptionService) {}

  ngOnInit() {
    //this.getSubscriptions();
  }

  getSubscriptions() {
    this.subscriptionService.getSubscriptions().subscribe({
      next: (response) => {
        if (response.result && response.data) {
          this.subscriptions = response.data;
          console.log('Subscriptions retrieved:', this.subscriptions);
        } else {
          console.error('Invalid response format:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching subscriptions:', error);
      }
    });
  }


  submitSubscription(subscriptionData: any) {
    this.subscriptionService.createSubscription(subscriptionData).subscribe({
      next: (response) => {
        this.successMessage = 'Inscription avec succès!';
        console.log('Subscription success:', response);
        setTimeout(() => {
          this.successMessage = '';
        }, 3000); // Réinitialise le message après 3 secondes
      },
      error: (error) => {
        console.error('Subscription failed:', error);
      }
    });
  }

  deleteSubscription(id: number) {
    this.subscriptionService.deleteSubscription(id).subscribe({
      next: () => {
        this.subscriptions = this.subscriptions.filter(subscription => subscription.id_subscription !== id);
        this.successDeleteMessage = `L'abonnement avec l'ID ${id} a été supprimé avec succès.`;
        console.log('Subscription deleted:', id);
        setTimeout(() => {
          this.successDeleteMessage = '';
        }, 3000); // Réinitialise le message après 3 secondes
      },
      error: (error) => {
        console.error('Error deleting subscription:', error);
      }
    });
  }

}
