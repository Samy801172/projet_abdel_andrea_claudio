import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { ManufacturingService } from '../../services/manufacturing/manufacturing.service';

@Component({
  selector: 'app-manufacturing-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-body">
          <h3>Détails de la fabrication #{{manufacturing?.id}}</h3>
          <p>Statut: {{manufacturing?.status}}</p>
          <p>Montant de l'acompte: {{manufacturing?.depositAmount}} €</p>
          <p>Date de création: {{manufacturing?.createdAt | date}}</p>
          <button *ngIf="!manufacturing?.depositPaid" 
                  [routerLink]="['/manufacturing', manufacturing?.id, 'payment']"
                  class="btn btn-primary">
            Payer l'acompte
          </button>
        </div>
      </div>
    </div>
  `
})
export class ManufacturingDetailsComponent implements OnInit {
  manufacturing: any;

  constructor(
    private manufacturingService: ManufacturingService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = +this.route.snapshot.params['id'];
    this.manufacturingService.getManufacturingDetails(id)
      .subscribe(data => this.manufacturing = data);
  }
} 