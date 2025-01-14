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
  credential: string | null = localStorage.getItem("clientId");
  baseUrl: string = "http://localhost:2024";
  avatar: string = ""; // URL de l'avatar actuel

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
        this.avatar = this.client.avatar;
      },
      error: (error) => {
        console.error('Erreur chargement profil :', error);
        this.notification.error('Impossible de charger le profil.');
      },
    });
  }

  // Upload de l'avatar
  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('Fichier sélectionné :', file);

      // Appel du service pour uploader l'avatar
      this.clientService.uploadAvatar(this.client.clientId, file).subscribe({
        next: (response) => {
          console.log('Réponse de l\'upload :', response);

          // Vérifiez si avatarPath existe dans la réponse
            this.avatar = response.avatarPath;
          console.log('Ayaaaaaaaa :', response);
            console.log('Avatar mis à jour :', this.avatar);

        },
        error: (err) => {
          console.error('Erreur lors de l\'upload de l\'avatar :', err);
        },
      });
    }
  }

  // Pour mettre à jour le profile
  updateProfile(): void {
    if (this.client && this.editForm) {
      // Appel du service pour mettre à jour le profil
      this.clientService.updateProfile(this.client.clientId, this.editForm).subscribe({
        next: (updatedClient: any) => {
          if (updatedClient && updatedClient.user) {
            this.client = updatedClient; // Mise à jour de l'objet client
            this.editMode = false; // Désactivation du mode édition
          }
          // Ajout d'un délai avant de recharger la page
          setTimeout(() => {
            window.location.reload(); // Actualiser la page
          }, 1000); // après 1 seconde
          this.notification.success('Profile mis à jour avec succès !');
          console.log(this.avatar);
        },
        error: (error) => {
          console.error('Erreur mise à jour profil:', error);
          this.notification.error('Erreur lors de la mise à jour du profil.');
        }
      });

      // Navigation après soumission
      this.router.navigate(['/client/profile']);
      console.log('vers profiles');
    }
  }
}
