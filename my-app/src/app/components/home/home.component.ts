import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
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

