// feature/Dashboard/DashboardComponent/admin/promotions/admin-promotions.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Promotion, PromotionPayload } from '../../../../../models/promotion/promotion.model';
import {PromotionService} from '../../../../../services/promotion/promotion.service';
import {NotificationService} from '../../../../../services/notification/notification.service';

interface ApiPromotion extends Omit<Promotion, 'startDate' | 'endDate'> {
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-admin-promotions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: 'admin-promotions.component.html',
  styleUrl: 'admin-promotions.component.scss'
})
export class AdminPromotionsComponent implements OnInit {
  promotions: Promotion[] = [];
  showAddForm = false;
  editingPromotion: Promotion | null = null;
  currentPromotion: PromotionPayload = {
    description: '',
    startDate: '',
    endDate: '',
    discountPercentage: 0
  };

  constructor(
    private promotionService: PromotionService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions(): void {
    this.promotionService.getAllPromotions().subscribe({
      next: (promotions) => {
        this.promotions = promotions;
      }
    });
  }

  isActive(promotion: Promotion): boolean {
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);
    return now >= startDate && now <= endDate;
  }

  onSubmit(): void {
    if (!this.validateDates()) {
      this.notificationService.error('Les dates ne sont pas valides');
      return;
    }

    if (this.editingPromotion) {
      this.updatePromotion();
    } else {
      this.createPromotion();
    }
  }

  // Ceci permet de réinitialiser le formulaire si on a appuyé sur modifier une promo juste avant
  toggleForm(): void {
    if (this.showAddForm) {
      // Si on ferme le formulaire, on remet tout à zéro
      this.cancelEdit();
    } else {
      // Si on ouvre pour créer une nouvelle promo, on s'assure de vider les champs
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


  private validateDates(): boolean {
    // Vérifier si les dates existent
    if (!this.currentPromotion.startDate || !this.currentPromotion.endDate) {
      return false;
    }

    // Convertir les dates en objets Date
    const startDate = new Date(this.currentPromotion.startDate);
    const endDate = new Date(this.currentPromotion.endDate);
    const now = new Date();

    // Vérifier si les dates sont valides
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return false;
    }

    // Comparer uniquement les jours (ignorer les heures)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

    return start >= today && end > start;
  }


  private createPromotion(): void {
    this.promotionService.createPromotion(this.currentPromotion).subscribe({
      next: () => {
        this.notificationService.success('Promotion créée avec succès');
        this.loadPromotions();
        this.cancelEdit();
      }
    });
  }

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


  editPromotion(promotion: Promotion): void {
    this.editingPromotion = promotion;
    this.currentPromotion = {
      description: promotion.description,
      startDate: this.formatDateForInput(promotion.startDate),
      endDate: this.formatDateForInput(promotion.endDate),
      discountPercentage: promotion.discountPercentage
    };
    this.showAddForm = true;
  }

  private formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

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

  deletePromotion(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette promotion ?')) {
      // Supprimer d'abord les produits associés
      this.promotionService.updateProductsToNull(id).subscribe({
        next: () => {
          // Ensuite, supprimer la promotion
          this.promotionService.deletePromotion(id).subscribe({
            next: () => {
              this.notificationService.success('Promotion supprimée avec succès');
              this.loadPromotions();
            },
          });
        },
      });
    }
  }
}
