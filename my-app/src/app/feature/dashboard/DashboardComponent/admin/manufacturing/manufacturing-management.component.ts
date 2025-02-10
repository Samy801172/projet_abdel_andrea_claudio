import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManufacturingService } from '../../../../../services/manufacturing/manufacturing.service';

@Component({
  selector: 'app-manufacturing-management',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>Gestion des Fabrications</h2>
      <div class="table-responsive">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Date de demande</th>
              <th>Statut</th>
              <th>Ordonnance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (item of manufacturingList; track item.id) {
              <tr>
                <td>{{item.id}}</td>
                <td>{{item.clientName}}</td>
                <td>{{item.createdAt | date}}</td>
                <td>
                  <span [class]="'badge ' + getStatusClass(item.status)">
                    {{item.status}}
                  </span>
                </td>
                <td>
                  <a [href]="item.prescriptionUrl" target="_blank">Voir</a>
                </td>
                <td>
                  <button class="btn btn-sm btn-success me-2"
                          (click)="validatePrescription(item.id)"
                          [disabled]="item.status !== 'PENDING'">
                    Valider
                  </button>
                  <button class="btn btn-sm btn-primary"
                          (click)="updateStatus(item.id, 'READY')"
                          [disabled]="!canMarkAsReady(item)">
                    Marquer comme prêt
                  </button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      padding: 0.5em 1em;
      border-radius: 4px;
    }
    .badge-pending { background: #ffd700; }
    .badge-validated { background: #90ee90; }
    .badge-ready { background: #98fb98; }
    .badge-completed { background: #3cb371; }
  `]
})
export class ManufacturingManagementComponent implements OnInit {
  manufacturingList: any[] = [];

  constructor(private manufacturingService: ManufacturingService) {}

  ngOnInit() {
    this.loadManufacturingList();
  }

  loadManufacturingList() {
    this.manufacturingService.getAllManufacturing()
      .subscribe(data => {
        this.manufacturingList = data;
      });
  }

  validatePrescription(id: number) {
    this.manufacturingService.validatePrescription(id)
      .subscribe(() => {
        this.loadManufacturingList();
      });
  }

  updateStatus(id: number, status: string) {
    this.manufacturingService.updateManufacturingStatus(id, status)
      .subscribe(() => {
        this.loadManufacturingList();
      });
  }

  getStatusClass(status: string): string {
    return `badge-${status.toLowerCase()}`;
  }

  canMarkAsReady(item: any): boolean {
    return item.status === 'VALIDATED' && item.depositPaid;
  }


  capturePayment(item: any): boolean {
    return item.status === 'VALIDATED' && item.depositPaid;
  }
}
