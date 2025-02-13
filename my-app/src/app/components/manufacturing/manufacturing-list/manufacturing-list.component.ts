import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ManufacturingService } from '../../../services/manufacturing/manufacturing.service';
import { Manufacturing } from '../../../models/manufacturing/manufacturing.model';
import { ManufacturingNotificationService } from '../../../services/manufacturing/manufacturing-notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-manufacturing-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="manufacturing-list">
      <h2>Mes Fabrications</h2>

      @if (loading) {
        <div class="loading">Chargement...</div>
      }

      @if (!loading && manufacturingItems.length === 0) {
        <div class="empty-state">
          <p>Aucune fabrication en cours</p>
        </div>
      }

      @if (!loading && manufacturingItems.length > 0) {
        <div class="items-grid">
          @for (item of manufacturingItems; track item.id) {
            <div class="fabrication-item">
              <div class="header">
                <div class="title">Fabrication #{{item.id}}</div>
                <div class="meta">
                  <div class="date">{{item.createdAt | date:'dd/MM/yyyy'}}</div>
                  <div class="status" [ngClass]="item.statusClass">
                    {{item.statusText}}
                  </div>
                </div>
                <div class="quantity">2</div>
              </div>

              <div class="content">
                <div>{{item.type}}</div>
                <div class="price-details">
                  <div>Prix Total: {{item.totalPrice || 40 | currency:'EUR'}}</div>
                  <div>Acompte (30%): {{(item.totalPrice * 0.3) || 12 | currency:'EUR'}}</div>
                </div>
              </div>

              <div class="footer">
                <div>Total: {{item.totalPrice || 40 | currency:'EUR'}}</div>
                @if (item.status === 'EN_ATTENTE_ACOMPTE') {
                  <a class="btn-primary" [routerLink]="['/manufacturing/payment', item.id]">
                    Payer l'acompte
                  </a>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .manufacturing-list {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .fabrication-item {
      background: white;
      margin-bottom: 20px;
      border-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .header {
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .title {
      font-weight: 500;
    }

    .meta {
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .date {
      color: #666;
    }

    .status {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 0.9em;
      font-weight: 500;
    }

    .status-pending { background-color: #ffc107; color: #000; }
    .status-deposit { background-color: #17a2b8; color: #fff; }
    .status-progress { background-color: #007bff; color: #fff; }
    .status-ready { background-color: #28a745; color: #fff; }
    .status-completed { background-color: #198754; color: #fff; }

    .quantity {
      background: #1976d2;
      color: white;
      padding: 2px 8px;
      border-radius: 4px;
    }

    .content {
      padding: 15px;
      border-top: 1px solid #eee;
    }

    .price-details {
      margin-top: 10px;
      color: #666;
    }

    .footer {
      padding: 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #eee;
    }

    .btn-primary {
      background: #007bff;
      color: white;
      padding: 6px 12px;
      border-radius: 4px;
      text-decoration: none;
    }

    .items-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .loading {
      text-align: center;
      padding: 20px;
    }

    .empty-state {
      text-align: center;
      padding: 20px;
    }
  `]
})
export class ManufacturingListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private refreshInterval: any;
  manufacturingItems: Manufacturing[] = [];
  readonly totalPrice = 40; // Prix fixe de 40€
  readonly deposit = 12; // Acompte de 30% (12€)
  loading = true;

  constructor(
    private manufacturingService: ManufacturingService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadManufacturingItems();
  }

  ngOnDestroy() {
    // Nettoyer l'intervalle quand le composant est détruit
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadManufacturingItems() {
    this.loading = true;
    this.manufacturingService.getClientManufacturingItems().subscribe({
      next: (items) => {
        console.log('Items reçus:', items);
        this.manufacturingItems = items;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement fabrications:', error);
        this.notificationService.error('Erreur lors du chargement des fabrications');
        this.loading = false;
      }
    });
  }
}
