import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-client-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="client-layout">
      <nav class="sidebar">
        <div class="logo">
          <h1>GOHAN-MED</h1>
          <p>Espace Client</p>
        </div>
        <ul class="nav-links">
          <li>
            <a routerLink="products" routerLinkActive="active">
              <span class="icon">🏥</span>
              Nos Produits
            </a>
          </li>
          <li>
            <a routerLink="prescriptions" routerLinkActive="active">
              <span class="icon">📋</span>
              Mes Ordonnances
            </a>
          </li>
          <li>
            <a routerLink="custom-meds" routerLinkActive="active">
              <span class="icon">⚗️</span>
              Sur Mesure
            </a>
          </li>
          <li>
            <a routerLink="appointments" routerLinkActive="active">
              <span class="icon">📅</span>
              Rendez-vous
            </a>
          </li>
          <li>
            <a routerLink="cart" routerLinkActive="active">
              <span class="icon">🛒</span>
              Mon Panier
            </a>
          </li>
          <li>
            <a routerLink="orders" routerLinkActive="active">
              <span class="icon">📦</span>
              Mes Commandes
            </a>
          </li>
          <li>
            <a routerLink="profile" routerLinkActive="active">
              <span class="icon">👤</span>
              Mon Profil
            </a>
          </li>
        </ul>
        <div class="logout">
          <button (click)="logout()" class="logout-btn">
            <span class="icon">🚪</span>
            Se déconnecter
          </button>
        </div>
      </nav>
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .client-layout {
      display: flex;
      min-height: 100vh;
    }

    .sidebar {
      width: 250px;
      background: #0066CC;
      padding: 1.5rem;
      color: white;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    }

    .logo {
      padding: 1rem;
      text-align: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 1.5rem;

      h1 {
        font-size: 1.5rem;
        margin: 0;
        font-weight: bold;
        color: white;
      }

      p {
        margin: 0.5rem 0 0;
        font-size: 0.9rem;
        opacity: 0.8;
      }
    }

    .nav-links {
      list-style: none;
      padding: 0;
      margin: 0;
      flex: 1;

      li a {
        display: flex;
        align-items: center;
        padding: 0.75rem 1rem;
        color: white;
        text-decoration: none;
        border-radius: 6px;
        margin-bottom: 0.5rem;
        transition: all 0.2s ease;
        font-weight: 500;

        .icon {
          margin-right: 0.75rem;
          font-size: 1.2rem;
        }

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateX(5px);
        }

        &.active {
          background: rgba(255, 255, 255, 0.2);
          font-weight: bold;
        }
      }
    }

    .logout {
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logout-btn {
      width: 100%;
      padding: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      color: #FFD2D2;
      border: 1px solid #FFD2D2;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;

      .icon {
        margin-right: 0.5rem;
      }

      &:hover {
        background: rgba(255, 210, 210, 0.1);
        color: white;
      }
    }

    .main-content {
      flex: 1;
      padding: 2rem;
      background: #f8fafc;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .client-layout {
        flex-direction: column;
      }

      .sidebar {
        width: 100%;
        padding: 1rem;
      }

      .nav-links li a {
        padding: 1rem;
        justify-content: center;

        .icon {
          margin-right: 0.5rem;
        }
      }
    }
  `]
})
export class ClientDashboardComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
