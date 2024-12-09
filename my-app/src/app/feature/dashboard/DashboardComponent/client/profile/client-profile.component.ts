// feature/Dashboard/DashboardComponent/client/profile/client-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../../../services';
import { Client } from '../../../../../models/client/client.model';
import { User } from '../../../../../models/user/user.model';

interface ClientWithUser extends Client {
  user: User; // On force le user à être non-null
}

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="profile-container">
      <h2>Mon Profil</h2>

      @if (client) {
        <div class="profile-info">
          <div class="info-group">
            <label>Nom</label>
            <p>{{client.lastName}}</p>
          </div>
          <div class="info-group">
            <label>Prénom</label>
            <p>{{client.firstName}}</p>
          </div>
          <div class="info-group">
            <label>Email</label>
            <p>{{client.user.email}}</p>
          </div>
          <div class="info-group">
            <label>Adresse</label>
            <p>{{client.address}}</p>
          </div>

          <button (click)="editMode = true" class="edit-btn">
            Modifier le profil
          </button>
        </div>

        @if (editMode) {
          <form (ngSubmit)="updateProfile()" class="edit-form">
            <div class="form-group">
              <label for="lastName">Nom</label>
              <input
                id="lastName"
                [(ngModel)]="editForm.lastName"
                name="lastName"
                type="text"
                required
              >
            </div>

            <div class="form-group">
              <label for="firstName">Prénom</label>
              <input
                id="firstName"
                [(ngModel)]="editForm.firstName"
                name="firstName"
                type="text"
                required
              >
            </div>

            <div class="form-group">
              <label for="address">Adresse</label>
              <input
                id="address"
                [(ngModel)]="editForm.address"
                name="address"
                type="text"
                required
              >
            </div>

            <div class="form-actions">
              <button type="submit" class="save-btn">Enregistrer</button>
              <button type="button" (click)="editMode = false" class="cancel-btn">
                Annuler
              </button>
            </div>
          </form>
        }
      }
    </div>
  `,
  styles: [/* ... styles restent les mêmes ... */]
})
export class ClientProfileComponent implements OnInit {
  client: ClientWithUser | null = null;
  editMode = false;
  editForm: Partial<Client> = {};

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.clientService.getClientProfile().subscribe({
      next: (clientData) => {
        if (clientData && clientData.user) {
          this.client = clientData as ClientWithUser;
          this.editForm = {
            firstName: this.client.firstName,
            lastName: this.client.lastName,
            address: this.client.address
          };
        }
      },
      error: (error) => {
        console.error('Erreur chargement profil:', error);
      }
    });
  }

  updateProfile(): void {
    if (this.client && this.editForm) {
      this.clientService.updateProfile(this.client.clientId, this.editForm).subscribe({
        next: (updatedClient) => {
          if (updatedClient && updatedClient.user) {
            this.client = updatedClient as ClientWithUser;
            this.editMode = false;
          }
        },
        error: (error) => {
          console.error('Erreur mise à jour profil:', error);
        }
      });
    }
  }
}
