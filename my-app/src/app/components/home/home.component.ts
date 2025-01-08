import {Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterModule} from '@angular/router';

// pour la détection de l'authentification "Claudio"
import { AuthService} from "../../services/auth/auth.service";

import {HomeService} from '../../services/home/home.service';
import {Product, ProductWithPromotion} from '../../models/product/product.model';
import {PromotionTimerComponent} from '../Promotion/promotion-timer.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule,PromotionTimerComponent],
  templateUrl: 'home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  currentYear = new Date().getFullYear();
  activePromotions: ProductWithPromotion[] = [];
  newProducts: Product[] = [];
  // variable booleen pour intéragir avec le html, la variable ngif
  isAuthenticated: boolean = false;
  username: string = this.newProducts.toString();

  constructor(
    private homeService: HomeService,
    private router: Router, // Ajout du Router
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.checkAuthentication();
    this.loadPromotions();
    this.loadNewProducts();
  }

  // Claudio fonction pour vérifier si connecté ou pas
  checkAuthentication() {
    this.isAuthenticated = this.authService.isLoggedIn(); // Vérifie si l'utilisateur est connecté
  }

  loadPromotions() {
    this.homeService.getActiveProductPromotions().subscribe({
      next: (promotions: ProductWithPromotion[]) => {
        console.log('Promotions reçues:', promotions);
        this.activePromotions = promotions;
      },
      error: (error) => {
        console.error('Erreur chargement promotions:', error);
      }
    });
  }

  loadNewProducts() {
    this.homeService.getNewProducts().subscribe({
      next: (products) => {
        this.newProducts = products;
      },
      error: (error) => {
        console.error('Erreur chargement nouveaux produits:', error);
      }
    });
  }
  getTimeRemaining(endDate: string) {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const distance = end - now;

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    return {
      days,
      hours,
      expired: distance < 0
    };
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/register']);
  }

  // Dans la classe HomeComponent, ajoutez cette méthode
  getImageFilename(productName: string): string {
    const name = productName.toLowerCase();
    if (name.includes('paracétamol')) return 'paracetamol.jpg';
    if (name.includes('ibuprofène')) return 'ibuprofene.jpg';
    if (name.includes('amoxicilline')) return 'antibiotique.jpg';
    if (name.includes('vitamine')) return 'vitamine-d.jpg';
    if (name.includes('omega')) return 'omega.jpg';
    return 'default-product.jpg';
  }
  getDefaultEndDate(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 15); // Promotion par défaut de 15 jours
    return date;
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

