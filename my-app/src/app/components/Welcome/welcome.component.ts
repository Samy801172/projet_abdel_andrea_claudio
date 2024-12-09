// components/welcome/welcome.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="welcome-container">
      <div class="welcome-box">
        <h1>Bienvenue sur IzzyBeauty! 🌟</h1>
        <div class="user-info">
          <p>Vous êtes connecté en tant que: {{ username }}</p>
          <p>{{ isAdmin ? 'Compte Administrateur' : 'Compte Client' }}</p>
        </div>
        <button class="logout-button" (click)="logout()">
          Se déconnecter
        </button>
      </div>
    </div>
  `,
  styles: [`
    .welcome-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: #f5f5f5;
      padding: 1rem;
    }

    .welcome-box {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      text-align: center;
    }

    h1 {
      color: #333;
      margin-bottom: 2rem;
    }

    .user-info {
      margin: 2rem 0;
      padding: 1rem;
      background-color: #f8f9fa;
      border-radius: 4px;
    }

    .logout-button {
      padding: 0.75rem 1.5rem;
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: #c82333;
      }
    }
  `]
})
export class WelcomeComponent {
  username: string;
  isAdmin: boolean;

  constructor() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.username = user.username || 'Invité';
    this.isAdmin = user.isAdmin || false;
  }

  logout() {
    localStorage.clear();
    window.location.href = '/login';
  }
}
