// shared/navbar/navbar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { ClientService } from '../../services/client/client.service';
import { Client } from '../../models/client/client.model';
import { User } from '../../models/user/user.model';
import {
  ClientProfileComponent
} from "../../feature/dashboard/DashboardComponent/client/profile/client-profile.component";

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule,],
  templateUrl: 'navbar.component.html',
  styleUrl: 'navbar.component.scss'
})
export class NavbarComponent {
  credential: string | null = localStorage.getItem("clientId");
  client: any;
  editForm: any = {}; // Initialisation de l'objet utilisé pour l'édition

  constructor(public authService: AuthService, private clientService: ClientService) {}

  ngOnInit()
  {
    this.loadName();
  }

  // ceci va charger l'username du client
  loadName(): void {
    if (this.credential == null) {
      console.warn('Credential non défini, impossible de charger le profil.');
      console.log(this.credential);
      return;
    }
    this.clientService.getClientProfile(Number(this.credential)).subscribe({
      next: (data) => {
        this.client = data;
        this.editForm = { ...this.client }; // Copie les données du client dans editForm
      },
      error: (error) => {
        console.error('Erreur chargement profil :', error);
      },
    });
  }

  onLogout(): void {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
    }
  }

  protected readonly ClientService = ClientService;
  protected readonly ClientProfileComponent = ClientProfileComponent;
}
