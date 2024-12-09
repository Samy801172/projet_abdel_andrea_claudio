import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <section class="hero">
        <div class="hero-content">
          <!-- Logo inline SVG pour garantir l'affichage -->
          <svg class="logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 200">
            <!-- Background Pills -->
            <circle cx="80" cy="100" r="60" fill="#e8f4ff"/>

            <!-- Medical Cross -->
            <path d="M60 80 h40 v-40 h40 v40 h40 v40 h-40 v40 h-40 v-40 h-40 z" fill="#4A90E2"/>

            <!-- Company Name -->
            <text x="200" y="115" font-family="Arial" font-size="48" font-weight="bold" fill="#2C3E50">
              GOHAN-MEDIC
            </text>

            <!-- Tagline -->
            <text x="200" y="145" font-family="Arial" font-size="18" fill="#7F8C8D">
              Votre pharmacie en ligne
            </text>

            <!-- DNA Helix Accent -->
            <path d="M180 70 q10 -10 20 0 t20 0 t20 0" stroke="#4A90E2" fill="none" stroke-width="3"/>
            <path d="M180 80 q10 10 20 0 t20 0 t20 0" stroke="#2980B9" fill="none" stroke-width="3"/>
          </svg>

          <h1>Gohan-Medic</h1>
          <p class="tagline">Votre pharmacie en ligne de confiance</p>
          <div class="cta-buttons">
            <a routerLink="/login" class="btn-primary">Se connecter</a>
            <a routerLink="/register" class="btn-secondary">S'inscrire</a>
          </div>
        </div>
      </section>

    </div>

    <!-- Avantages Section -->
    <section class="features">
      <div class="features-grid">
        <div class="feature-card">
          <div class="icon">💊</div>
          <h3>Médicaments sur Mesure</h3>
          <p>Service de préparation magistrale personnalisée</p>
        </div>
        <div class="feature-card">
          <div class="icon">🚚</div>
          <h3>Livraison Rapide</h3>
          <p>Recevez vos médicaments en toute sécurité</p>
        </div>
        <div class="feature-card">
          <div class="icon">👨‍⚕️</div>
          <h3>Conseils d'Experts</h3>
          <p>Une équipe de pharmaciens à votre écoute</p>
        </div>
      </div>
    </section>

    <!-- Services Section -->
    <section class="services">
      <h2>Nos Services</h2>
      <div class="service-grid">
        @for (service of services; track service.title) {
          <div class="service-card">
            <img [src]="service.image" [alt]="service.title">
            <h3>{{service.title}}</h3>
            <p>{{service.description}}</p>
          </div>
        }
      </div>
    </section>
    <footer class="footer">
      <p>&copy; {{ currentYear }} Gohan-Medic. Tous droits réservés.</p>
    </footer>
  `,
  styles: [`
    .home-container {
      min-height: 100vh;
      background: linear-gradient(to bottom, #f3f4f6, #ffffff);
    }

    .hero {
      height: 80vh;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      background: linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9));
      padding: 2rem;
    }

    .hero-content {
      max-width: 800px;
    }

    .logo {
      width: auto;
      height: 200px;
      margin-bottom: 2rem;
    }

    h1 {
      font-size: 3.5rem;
      color: #1f2937;
      margin-bottom: 1rem;
      font-weight: bold;
    }

    .tagline {
      font-size: 1.5rem;
      color: #4b5563;
      margin-bottom: 2.5rem;
    }

    .cta-buttons {
      display: flex;
      gap: 1.5rem;
      justify-content: center;

      a {
        padding: 1rem 2.5rem;
        border-radius: 8px;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.3s ease;
      }

      .btn-primary {
        background: #4f46e5;
        color: white;
        &:hover { background: #4338ca; }
      }

      .btn-secondary {
        border: 2px solid #4f46e5;
        color: #4f46e5;
        &:hover {
          background: #4f46e5;
          color: white;
        }
      }
    }

    .features {
      padding: 4rem 2rem;
      background: white;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .feature-card {
      padding: 2rem;
      text-align: center;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;

      &:hover {
        transform: translateY(-5px);
      }

      .icon {
        font-size: 2.5rem;
        margin-bottom: 1rem;
      }

      h3 {
        font-size: 1.25rem;
        color: #1f2937;
        margin-bottom: 0.75rem;
      }

      p {
        color: #6b7280;
      }
    }

    .services {
      padding: 4rem 2rem;
      background: #f3f4f6;

      h2 {
        text-align: center;
        font-size: 2.5rem;
        color: #1f2937;
        margin-bottom: 3rem;
      }

      .service-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        max-width: 1200px;
        margin: 0 auto;
      }

      .service-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease;

        &:hover {
          transform: translateY(-5px);
        }

        img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }

        h3 {
          font-size: 1.25rem;
          color: #1f2937;
          margin: 1rem;
        }

        p {
          color: #6b7280;
          margin: 0 1rem 1rem;
        }
      }
    }

    .footer {
      text-align: center;
      padding: 2rem;
      background: #f9fafb;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .hero {
        height: auto;
        padding: 4rem 1rem;
      }

      .logo {
        height: 150px;
      }

      h1 {
        font-size: 2.5rem;
      }

      .tagline {
        font-size: 1.25rem;
      }

      .cta-buttons {
        flex-direction: column;
        gap: 1rem;
      }

      .features-grid, .service-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }
  services = [
    {
      title: 'Médicaments sur Ordonnance',
      description: 'Service sécurisé de traitement des prescriptions',
      image: 'assets/prescription.jpg'
    },
    {
      title: 'Préparations Magistrales',
      description: 'Médicaments personnalisés selon vos besoins',
      image: 'assets/custom-med.jpg'
    },
    {
      title: 'Parapharmacie',
      description: 'Large gamme de produits de santé et bien-être',
      image: 'assets/parapharmacie.jpg'
    },
    {
      title: 'Conseil Pharmaceutique',
      description: 'Consultations en ligne avec nos pharmaciens',
      image: 'assets/conseil.jpg'
    },
    {
      title: 'Service d\'Urgence',
      description: 'Disponibilité 24/7 pour vos besoins urgents',
      image: 'assets/urgence.jpg'
    },
    {
      title: 'Suivi de Traitement',
      description: 'Accompagnement personnalisé de votre santé',
      image: 'assets/suivi.jpg'
    }
  ];
}

