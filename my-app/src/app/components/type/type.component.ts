// components/type/type.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeService } from '../../services/type/type.service';
import { Type } from '../../models/type/type.model';

@Component({
  selector: 'app-type',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:'./type.component.html',
  styleUrls:['./type.component.css']

})
export class TypeComponent implements OnInit {
  types: Type[] = [];
  newType: Partial<Type> = {
    name: '',
    description: '',
    icon: ''
  };
  showForm = false;
  isLoading = false;
  error = '';
  success = '';

  constructor(private typeService: TypeService) {}

  ngOnInit(): void {
    this.loadTypes();
  }

  loadTypes(): void {
    this.typeService.getTypes().subscribe({
      next: (types) => this.types = types,
      error: (err) => this.error = 'Erreur lors du chargement des types'
    });
  }

  createType(): void {
    if (!this.newType.name?.trim() || !this.newType.description?.trim() || !this.newType.icon) {
      this.error = 'Tous les champs sont obligatoires';
      return;
    }

    if (this.newType.name.length > 200) {
      this.error = 'Le nom ne doit pas dépasser 200 caractères';
      return;
    }

    // Vérifier si le type existe déjà
    if (this.types.some(t => t.name.toLowerCase() === this.newType.name?.toLowerCase())) {
      this.error = 'Ce type existe déjà';
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.typeService.createType(this.newType).subscribe({
      next: () => {
        this.success = 'Type créé avec succès';
        this.loadTypes();
        this.resetForm();
      },
      error: (err) => {
        this.error = 'Erreur lors de la création du type';
        console.error(err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  editType(type: Type): void {
    this.newType = { ...type };
    this.showForm = true;
  }

  confirmDelete(type: Type): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le type "${type.name}" ?`)) {
      this.deleteType(type.id_type);
    }
  }

  deleteType(id: number): void {
    this.typeService.deleteType(id).subscribe({
      next: () => {
        this.success = 'Type supprimé avec succès';
        this.loadTypes();
      },
      error: (err) => {
        this.error = 'Erreur lors de la suppression';
        console.error(err);
      }
    });
  }

  private resetForm(): void {
    this.newType = {
      name: '',
      description: '',
      icon: ''
    };
    this.showForm = false;
  }
}
