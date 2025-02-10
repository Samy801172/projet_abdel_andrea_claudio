import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ManufacturingService } from '../../../../services/manufacturing/manufacturing.service';

@Component({
  selector: 'app-manufacturing-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <div class="card">
        <div class="card-body">
          <h3>Détails de la fabrication #{{manufacturing?.id}}</h3>
          
          <div class="alert" [ngClass]="getStatusClass()">
            Statut actuel: {{getStatusLabel()}}
          </div>

          <p>Montant de l'acompte: {{manufacturing?.depositAmount}} €</p>
          <p>Date de création: {{manufacturing?.createdAt | date}}</p>

          @if (!manufacturing?.depositPaid) {
            <button class="btn btn-primary" 
                    [routerLink]="['/manufacturing', manufacturing?.id, 'payment']">
              Payer l'acompte
            </button>
          }

          @if (manufacturing?.depositPaid && manufacturing?.status === 'READY') {
            <div class="alert alert-success">
              Votre médicament est prêt ! Vous pouvez venir le récupérer en pharmacie.
            </div>
          }
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