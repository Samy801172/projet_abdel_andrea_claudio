// shared/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-content">
        <div class="nav-brand">
          <svg class="nav-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 50">
            <!-- Logo existant -->
          </svg>
        </div>
        <div class="nav-links">
          @if (!authService.isAuthenticated()) {
            <a routerLink="/" class="nav-link">Accueil</a>
            <a routerLink="/login" class="nav-link">Connexion</a>
            <a routerLink="/register" class="nav-link">Inscription</a>
          }

          @if (authService.isAuthenticated() && !authService.isAdmin()) {
            <a routerLink="/" class="nav-link">Accueil</a>
            <a routerLink="/client/products" class="nav-link">Médicaments</a>
            <a routerLink="/client/services" class="nav-link">Services</a>
            <a routerLink="/client/prescriptions" class="nav-link">Mes Ordonnances</a>
            <a routerLink="/client/custom-meds" class="nav-link">Sur Mesure</a>
            <a routerLink="/client/appointments" class="nav-link">Rendez-vous</a>
            <a routerLink="/client/cart" class="nav-link">Panier</a>
            <button (click)="onLogout()" class="nav-link logout">
              Déconnexion
            </button>
          }

          @if (authService.isAuthenticated() && authService.isAdmin()) {
            <a routerLink="/admin" class="nav-link">Dashboard Admin</a>
            <button (click)="onLogout()" class="nav-link logout">
              Déconnexion
            </button>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      background: #0066CC;
      padding: 0.75rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .nav-content {
      max-width: 1400px;
      margin: 0 auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 1rem;
    }

    .nav-brand {
      .nav-logo {
        height: 35px;
        width: auto;
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }
    }

    .nav-links {
      display: flex;
      gap: 1rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      font-weight: 600;
      font-size: 1rem;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      transition: all 0.2s ease;
      white-space: nowrap;
      letter-spacing: 0.3px;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }

      &.logout {
        background: none;
        border: none;
        cursor: pointer;
        font: inherit;
        color: #FFD2D2;
        border: 1px solid #FFD2D2;

        &:hover {
          background: rgba(255, 210, 210, 0.1);
          color: white;
        }
      }
    }

    @media (max-width: 1024px) {
      .nav-content {
        flex-direction: column;
        gap: 1rem;
        padding: 0.5rem;
      }

      .nav-links {
        justify-content: center;
        gap: 0.5rem;
      }

      .nav-link {
        font-size: 0.9rem;
        padding: 0.5rem 0.8rem;
      }
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 0.5rem;
      }

      .nav-content {
        width: 100%;
      }

      .nav-links {
        width: 100%;
        flex-direction: column;
        align-items: stretch;

        .nav-link {
          text-align: center;
          padding: 0.8rem;
          border-radius: 4px;

          &:not(:last-child) {
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          }
        }
      }
    }
  `]
})
export class NavbarComponent {
  constructor(public authService: AuthService) {}

  onLogout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
    }
  }
}
