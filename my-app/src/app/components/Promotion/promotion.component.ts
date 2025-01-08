// promotion.component.ts
import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-promotion',
  templateUrl: './promotion.component.html',
  styleUrls: ['./promotion.component.scss'],
  imports: [
    FormsModule,
    NgIf
  ],
  standalone: true
})
export class PromotionComponent {
  description: string = '';
  startDate: string = '';
  endDate: string = '';
  discountPercentage: number = 0;
  successMessage: string = '';
  errorMessage: string = '';

  // Méthode pour créer une promotion (exemple)
  createPromotion() {
    // Logique de création de promotion
  }
}
