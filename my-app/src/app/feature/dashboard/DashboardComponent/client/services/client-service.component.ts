// src/app/feature/Client/Dashboard/ClientServicesComponent/client-services.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientServiceService } from 'app/feature/Dashboard/DashboardComponent/client/services/client-service.component';
import { NotificationService } from '../../../../../services/notification/notification.service';

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;  // durée en minutes
}

@Component({
  selector: 'app-client-services',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="client-services-container">
      <header class="page-header">
        <h2>Nos Services</h2>
      </header>

      <div *ngIf="loading" class="loading">Chargement des services...</div>

      <div *ngIf="error" class="error">{{ error }}</div>

      <div class="services-grid" *ngIf="!loading && !error">
        <div *ngIf="services.length === 0" class="no-data">Aucun service disponible pour le moment.</div>
        <div *ngFor="let service of services" class="service-card">
          <div class="service-content">
            <h3>{{service.name}}</h3>
            <p class="description">{{service.description}}</p>
            <div class="service-details">
              <span class="price">{{service.price | currency:'EUR'}}</span>
              <span class="duration">{{formatDuration(service.duration)}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .client-services-container {
        padding: 20px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 20px;
        h2 {
          color: #333;
          margin: 0;
        }
      }

      .services-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 20px;
      }

      .service-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .service-content {
          h3 {
            margin: 0 0 10px 0;
            color: #333;
            font-size: 1.2em;
          }

          .description {
            color: #6b7280;
            margin: 10px 0;
            line-height: 1.5;
          }

          .service-details {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10px;

            .price {
              color: #4f46e5;
              font-weight: 600;
              font-size: 1.1em;
            }

            .duration {
              color: #6b7280;
              font-size: 0.9em;
            }
          }
        }
      }

      .loading {
        text-align: center;
        color: #333;
      }

      .error {
        color: #b91c1c;
        text-align: center;
      }

      .no-data {
        text-align: center;
        color: #666;
        background: white;
        border-radius: 8px;
        padding: 40px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
    `
  ]
})
export class ClientServicesComponent implements OnInit {
  services: Service[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private clientServiceService: ClientServiceService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadServices();
  }

  loadServices(): void {
    this.loading = true;
    this.clientServiceService.getAllServices().subscribe({
      next: (services) => {
        this.services = services;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur chargement services:', error);
        this.error = 'Erreur lors du chargement des services. Veuillez réessayer.';
        this.loading = false;
      }
    });
  }

  formatDuration(minutes: number): string {
    if (!minutes) return '0 min';
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h${remainingMinutes}min` : `${hours}h`;
    }
    return `${minutes}min`;
  }
}
