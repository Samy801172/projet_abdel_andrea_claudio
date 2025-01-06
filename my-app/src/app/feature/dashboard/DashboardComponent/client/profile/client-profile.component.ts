import { Component, OnInit } from '@angular/core';
import { ClientService } from '../../../../../services';
import { Client } from '../../../../../models/client/client.model';
import { User } from '../../../../../models/user/user.model';
import {FormsModule} from "@angular/forms";

interface ClientWithUser extends Client {
  user: User; // Force user to be non-null
}

@Component({
  selector: 'app-client-profile',
  standalone: true,
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.scss'],
  imports: [
    FormsModule
  ]
})
export class ClientProfileComponent implements OnInit {
  // Initialisation de `client` avec une valeur par défaut
  client: ClientWithUser = {
    clientId: 2,
    firstName: '',
    lastName: '',
    address: '',
    user: {
      id: 0,
      email: '',
      firstName: '',
      lastName: '',
      role: 'ADMIN' || 'CLIENT',
    },
  };

  editMode: boolean = false;
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
            address: this.client.address,
          };
        }
      },
      error: (error) => {
        console.error('Erreur chargement profil:', error);
      },
    });
  }

  updateProfile(): void {
    if (this.client && this.editForm) {
      this.clientService
        .updateProfile(this.client.clientId, this.editForm)
        .subscribe({
          next: (updatedClient) => {
            if (updatedClient && updatedClient.user) {
              this.client = updatedClient as ClientWithUser;
              this.editMode = false;
            }
          },
          error: (error) => {
            console.error('Erreur mise à jour profil:', error);
          },
        });
    }
  }

  cancelEdit(): void {
    this.editMode = false;
    if (this.client) {
      this.editForm = {
        firstName: this.client.firstName,
        lastName: this.client.lastName,
        address: this.client.address,
      };
    }
  }
}
