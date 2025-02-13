import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ManufacturingService } from '../../services/manufacturing.service';
import { ManufacturingNotificationService } from '../../services/notification/manufacturing-notification.service';
import { Manufacturing } from '../../models/manufacturing/manufacturing.model';

@Component({
  selector: 'app-manufacturing-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="manufacturing-container">
      <h2>Gestion des Fabrications</h2>
      
      <div class="manufacturing-grid">
        <div *ngFor="let item of manufacturingItems" class="manufacturing-card">
          <div class="card-header">
            <h3>Commande #{{item.orderId}}</h3>
            <span [class]="'status-badge ' + item.status.toLowerCase()">
              {{item.status}}
            </span>
          </div>
          
          <div class="card-body">
            <p>Date début: {{item.startDate | date:'short'}}</p>
            <p *ngIf="item.completionDate">
              Terminé le: {{item.completionDate | date:'short'}}
            </p>
            
            <div class="status-update">
              <select [(ngModel)]="item.statusId" 
                      (change)="updateStatus(item.id, item.statusId)">
                <option [value]="1">En attente</option>
                <option [value]="2">En préparation</option>
                <option [value]="3">Contrôle qualité</option>
                <option [value]="4">Terminé</option>
              </select>
              
              <textarea [ngModel]="item.notes" 
                        (ngModelChange)="item.notes = $event"
                        placeholder="Notes de fabrication"
                        (blur)="updateNotes(item.id, item.notes || '')">
              </textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .manufacturing-container {
      padding: 20px;
    }
    
    .manufacturing-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }
    
    .manufacturing-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
    }
    
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }
    
    .status-badge {
      padding: 5px 10px;
      border-radius: 15px;
      font-size: 0.9em;
    }
    
    .status-badge.en-attente { background: #ffd700; }
    .status-badge.en-preparation { background: #87ceeb; }
    .status-badge.controle-qualite { background: #ffa500; }
    .status-badge.termine { background: #90ee90; }
    
    .status-update {
      margin-top: 15px;
    }
    
    select, textarea {
      width: 100%;
      margin-top: 10px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  `]
})
export class ManufacturingListComponent implements OnInit {
  manufacturingItems: Manufacturing[] = [];

  constructor(
    private manufacturingService: ManufacturingService,
    private notificationService: ManufacturingNotificationService
  ) {}

  ngOnInit() {
    this.loadManufacturingItems();
  }

  loadManufacturingItems() {
    this.manufacturingService.getAllManufacturing()
      .subscribe({
        next: (items) => {
          this.manufacturingItems = items;
        },
        error: (error) => console.error('Erreur lors du chargement des fabrications:', error)
      });
  }

  updateStatus(id: number, statusId: number) {
    this.manufacturingService.updateStatus(id, statusId)
      .subscribe({
        next: (response) => {
          this.notificationService.notifyManufacturingUpdate(response);
          this.loadManufacturingItems();
        },
        error: (error) => console.error('Erreur lors de la mise à jour:', error)
      });
  }

  updateNotes(id: number, notes: string) {
    const currentItem = this.manufacturingItems.find(item => item.id === id);
    if (currentItem) {
      this.manufacturingService.updateStatus(id, currentItem.statusId, notes)
        .subscribe({
          next: (response) => {
            this.notificationService.notifyManufacturingUpdate(response);
            this.loadManufacturingItems();
          },
          error: (error) => console.error('Erreur lors de la mise à jour des notes:', error)
        });
    }
  }
} 