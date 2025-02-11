// Importation des modules Angular nécessaires
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

// Importation des modèles et services liés aux promotions
import { Promotion, PromotionPayload } from '../../../../../models/promotion/promotion.model';
import { PromotionService } from '../../../../../services/promotion/promotion.service';
import { NotificationService } from '../../../../../services/notification/notification.service';

// Interface pour gérer la structure des promotions avec des dates sous forme de chaîne de caractères
interface ApiPromotion extends Omit<Promotion, 'startDate' | 'endDate'> {
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-admin-promotions', // Sélecteur du composant
  standalone: true,
  imports: [CommonModule, FormsModule], // Modules utilisés dans le composant
  templateUrl: 'admin-promotions.component.html', // Fichier HTML associé
  styleUrl: 'admin-promotions.component.scss' // Fichier SCSS associé
})
export class AdminPromotionsComponent implements OnInit {
  promotions: Promotion[] = []; // Tableau contenant la liste des promotions
  showAddForm = false; // Indicateur pour afficher ou masquer le formulaire
  editingPromotion: Promotion | null = null; // Promotion en cours d'édition
  currentPromotion: PromotionPayload = {
    description: '',
    startDate: '',
    endDate: '',
    discountPercentage: 0
  };

  constructor(
    private promotionService: PromotionService, // Service pour gérer les promotions
    private notificationService: NotificationService // Service pour afficher des notifications
  ) {}

  ngOnInit(): void {
    this.loadPromotions(); // Chargement des promotions au démarrage du composant
  }

  // Récupère toutes les promotions depuis l'API
  loadPromotions(): void {
    this.promotionService.getAllPromotions().subscribe({
      next: (promotions) => {
        this.promotions = promotions; // Mise à jour de la liste des promotions
      }
    });
  }

  // Vérifie si une promotion est active en comparant ses dates avec la date actuelle
  isActive(promotion: Promotion): boolean {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate;
  }

  // Soumet le formulaire pour créer ou mettre à jour une promotion
  onSubmit(): void {
    if (!this.validateDates()) {
      this.notificationService.error('Les dates ne sont pas valides'); // Affiche un message d'erreur si les dates sont incorrectes
      return;
    }

    if (this.editingPromotion) {
      this.updatePromotion(); // Met à jour la promotion existante
    } else {
      this.createPromotion(); // Crée une nouvelle promotion
    }
  }

  // Ouvre ou ferme le formulaire d'ajout/modification
  toggleForm(): void {
    if (this.showAddForm) {
      this.cancelEdit(); // Réinitialise les valeurs du formulaire en cas de fermeture
    } else {
      this.editingPromotion = null;
      this.currentPromotion = {
        description: '',
        startDate: '',
        endDate: '',
        discountPercentage: 0
      };
      this.showAddForm = true;
    }
  }

  // Vérifie que les dates de la promotion sont valides
  private validateDates(): boolean {
    if (!this.currentPromotion.startDate || !this.currentPromotion.endDate) {
      return false;
    }

    const startDate = new Date(this.currentPromotion.startDate);
    const endDate = new Date(this.currentPromotion.endDate);
    const now = new Date();

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false;
    }

    // On ignore les heures pour ne comparer que les jours
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    return start >= today && end > start; // Vérifie que la date de début est valide et que la date de fin est après la date de début
  }

  // Crée une nouvelle promotion via le service
  private createPromotion(): void {
    this.promotionService.createPromotion(this.currentPromotion).subscribe({
      next: () => {
        this.notificationService.success('Promotion créée avec succès');
        this.loadPromotions(); // Recharge la liste des promotions
        this.cancelEdit();
      }
    });
  }

  // Met à jour une promotion existante
  private updatePromotion(): void {
    if (!this.editingPromotion) return;

    this.promotionService.updatePromotion(
      this.editingPromotion.id_promotion,
      this.currentPromotion
    ).subscribe({
      next: () => {
        this.notificationService.success('Promotion mise à jour avec succès');
        this.loadPromotions();
        this.cancelEdit();
      }
    });
  }

  // Prépare une promotion pour l'édition
  editPromotion(promotion: Promotion): void {
    this.editingPromotion = promotion;
    this.currentPromotion = {
      description: promotion.description,
      startDate: this.formatDateForInput(promotion.startDate),
      endDate: this.formatDateForInput(promotion.endDate),
      discountPercentage: promotion.discountPercentage
    };
    this.showAddForm = true; // Ouvre le formulaire
  }

  // Convertit une date en format compatible avec les champs input[type="date"]
  private formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0]; // Retourne la date sous format YYYY-MM-DD
  }

  // Annule l'édition et réinitialise le formulaire
  cancelEdit(): void {
    this.showAddForm = false;
    this.editingPromotion = null;
    this.currentPromotion = {
      description: '',
      startDate: '',
      endDate: '',
      discountPercentage: 0
    };
  }

  // Supprime une promotion après confirmation
  deletePromotion(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      // Supprime d'abord les produits associés à la promotion avant de la supprimer
      this.promotionService.updateProductsToNull(id).subscribe({
        next: () => {
          this.promotionService.deletePromotion(id).subscribe({
            next: () => {
              this.notificationService.success('Promotion supprimée avec succès');
              this.loadPromotions(); // Recharge la liste des promotions
            },
          });
        },
      });
    }
  }
}
