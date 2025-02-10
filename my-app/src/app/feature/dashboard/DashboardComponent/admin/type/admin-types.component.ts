import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Type } from '../../../../../models/type/type.model';
import { TypeService } from '../../../../../services/type/type.service';
import { NotificationService } from '../../../../../services/notification/notification.service';

@Component({
  selector: 'app-admin-types',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-types.component.html',
  styleUrl: './admin-types.component.scss'
  })

  export class AdminTypesComponent implements OnInit {
    // Propriétés
    types: Type[] = [];
    loading = false;
    error = '';
    showForm = false;
    showDeleteModal = false;
    editingType: Type | null = null;
    typeToDelete: Type | null = null;

    currentType: Partial<Type> = {
      name: '',
      description: '',
      icon: '',
      prescription_required: false
    };

    constructor(
      private typeService: TypeService,
      private notificationService: NotificationService
    ) {
    }

    ngOnInit(): void {
      this.loadTypes();
    }

  trackById(index: number, type: any): number {
    return type.id_type; // Assure-toi que `id_type` est le champ unique de tes objets
  }


  // Chargement des types
    loadTypes(): void {
      this.loading = true;
      this.error = '';

      this.typeService.getTypes().subscribe({
        next: (types) => {
          this.types = types;
          this.loading = false;
        },
        error: (error) => {
          this.error = 'Erreur lors du chargement des types';
          this.loading = false;
          console.error('Erreur:', error);
        }
      });
    }

    // Gestion du formulaire d'ajout
    startAdd(): void {
      this.editingType = null;
      this.resetForm();
      this.showForm = true;
    }

    // Gestion de la modification
    editType(type: Type): void {
      this.editingType = type;
      this.currentType = {...type};
      this.showForm = true;
    }

    // Gestion de la suppression
    confirmDelete(type: Type): void {
      this.typeToDelete = type;
      this.showDeleteModal = true;
    }

    cancelDelete(): void {
      this.typeToDelete = null;
      this.showDeleteModal = false;
    }

    cancelEdit(): void {
      this.showForm = false;
      this.editingType = null;
      this.resetForm();
    }

    // Soumission du formulaire
    onSubmit(): void {
      if (!this.currentType.name || !this.currentType.description || !this.currentType.icon) {
        this.notificationService.error('Veuillez remplir tous les champs obligatoires');
        return;
      }

      if (this.editingType) {
        this.updateExistingType();
      } else {
        this.createNewType();
      }
    }

    private updateExistingType(): void {
      if (!this.editingType) return;

      this.typeService.updateType(this.editingType.id_type, this.currentType).subscribe({
        next: () => {
          this.notificationService.success('Type modifié avec succès');
          this.loadTypes();
          this.cancelEdit();
        },
        error: (error) => {
          if (error.status === 409) {
            this.notificationService.error('Ce type existe déjà');
          } else {
            this.notificationService.error('Erreur lors de la modification');
          }
        }
      });
    }

    private createNewType(): void {
      this.typeService.getTypes().subscribe(types => {
        const exists = types.some(t =>
          t.name.toLowerCase() === this.currentType.name?.toLowerCase()
        );

        if (exists) {
          this.notificationService.error('Ce type existe déjà');
          return;
        }

        this.typeService.createType(this.currentType).subscribe({
          next: () => {
            this.notificationService.success('Type ajouté avec succès');
            this.loadTypes();
            this.cancelEdit();
          },
          error: () => {
            this.notificationService.error('Erreur lors de la création');
          }
        });
      });
    }

    // Suppression d'un type
    deleteType(): void {
      if (!this.typeToDelete) return;

      this.loading = true;
      this.typeService.deleteType(this.typeToDelete.id_type).subscribe({
        next: () => {
          this.notificationService.success('Type supprimé avec succès');
          this.loadTypes();
          this.cancelDelete();
        },
        error: (error) => {
          if (error.status === 409) {
            this.notificationService.error(
              'Ce type ne peut pas être supprimé car il est associé à des produits'
            );
          } else {
            this.notificationService.error('Erreur lors de la suppression');
          }
        },
        complete: () => {
          this.loading = false;
        }
      });
    }

    // Réinitialisation du formulaire
    private resetForm(): void {
      this.currentType = {
        name: '',
        description: '',
        icon: '',
        prescription_required: false
      };
    }
  }

