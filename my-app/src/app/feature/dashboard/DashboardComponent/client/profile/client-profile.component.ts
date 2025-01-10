// feature/Dashboard/DashboardComponent/client/profile/client-profile.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../../../services';
import { Client } from '../../../../../models/client/client.model';
import { User } from '../../../../../models/user/user.model';
import { ChangeDetectorRef } from '@angular/core';
import { NotificationService } from '../../../../../services/notification/notification.service';
import { Router, RouterModule } from '@angular/router';
import {createMessageDiagnostic} from "@angular/compiler-cli/src/transformers/util";


interface ClientWithUser extends Client {
  user: User; // On force le user à être non-null
}

@Component({
  selector: 'app-client-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: 'client-profile.component.html',
  styleUrl : 'client-profile.component.scss'
})
export class ClientProfileComponent implements OnInit {
  //client: ClientWithUser | null = null;
  client: any;
  editMode = false;
  editForm: any = {}; // Initialisation de l'objet utilisé pour l'édition
  //nom: string = "Colina";
  //prenom: string = "Claudio";
  //mail: string = "xpdark@gmail.com";
  //adress: string = "Rue de la cité, 12 - 4100 Seraing";
  credential: string | null = localStorage.getItem("clientId");

  constructor(private clientService: ClientService,
              private cdr: ChangeDetectorRef,
              private notification: NotificationService,
              private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  // charge le profile de l'utilisateur (Claudio)
  loadProfile(): void {
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
        this.notification.error('Impossible de charger le profil.');
      },
    });
  }

  updateProfile(): void {
    if (this.client && this.editForm) {
      // Appel du service pour mettre à jour le profil
      this.clientService.updateProfile(this.client.clientId, this.editForm).subscribe({
        next: (updatedClient: any) => {
          if (updatedClient && updatedClient.user) {
            this.client = updatedClient; // Mise à jour de l'objet client
            this.editMode = false; // Désactivation du mode édition
          }
          this.notification.success('Profile mis à jour avec succès !');
        },
        error: (error) => {
          console.error('Erreur mise à jour profil:', error);
          this.notification.error('Erreur lors de la mise à jour du profil.');
        },
      });

      // Navigation après soumission
      this.router.navigate(['/profile']);
      console.log('vers profiles');
    }
  }
}
