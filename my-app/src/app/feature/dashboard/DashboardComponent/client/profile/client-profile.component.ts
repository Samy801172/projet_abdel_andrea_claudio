// Importations nécessaires pour le composant
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ClientService } from '../../../../../services';
import { Client } from '../../../../../models/client/client.model';
import { User } from '../../../../../models/user/user.model';
import { NotificationService } from '../../../../../services/notification/notification.service';
import { Router, RouterModule } from '@angular/router';

// Interface étendant Client pour inclure User
interface ClientWithUser extends Client {
  user: User; // On force 'user' à être non-null
}

@Component({
  selector: 'app-client-profile', // Sélecteur du composant
  standalone: true, // Permet d'utiliser ce composant indépendamment d'un module
  imports: [CommonModule, FormsModule, RouterModule], // Modules nécessaires
  templateUrl: 'client-profile.component.html', // Lien vers le fichier HTML
  styleUrl: 'client-profile.component.scss' // Lien vers le fichier SCSS
})
export class ClientProfileComponent implements OnInit {
  client: any; // Stocke les informations du client
  editMode = false; // Détermine si le mode édition est activé
  editForm: any = {}; // Objet utilisé pour l'édition du profil
  credential: string | null = localStorage.getItem("clientId"); // Récupération de l'ID du client
  baseUrl: string = "http://localhost:2024"; // URL de base du serveur
  avatar: string = ""; // Stocke l'URL de l'avatar du client

  constructor(
    private clientService: ClientService, // Service client pour les requêtes API
    private cdr: ChangeDetectorRef, // Permet de détecter les changements manuellement
    private notification: NotificationService, // Service pour afficher des notifications
    private router: Router // Service de navigation Angular
  ) {}

  ngOnInit(): void {
    this.loadProfile(); // Charge le profil du client au démarrage
  }

  /**
   * Charge le profil du client en utilisant son ID.
   */
  loadProfile(): void {
    if (this.credential == null) {
      console.warn('Credential non défini, impossible de charger le profil.');
      return;
    }

    this.clientService.getClientProfile(Number(this.credential)).subscribe({
      next: (data) => {
        this.client = data; // Stocke les données du client
        this.editForm = { ...this.client }; // Copie les données du client dans editForm pour modification
        this.avatar = this.client.avatar; // Stocke l'avatar du client
      },
      error: (error) => {
        console.error('Erreur chargement profil :', error);
        this.notification.error('Impossible de charger le profil.');
      },
    });
  }

  /**
   * Gère l'upload d'un avatar.
   */
  onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0]; // Récupère le fichier sélectionné
      console.log('Fichier sélectionné :', file);

      // Envoi du fichier au serveur pour mise à jour de l'avatar
      this.clientService.uploadAvatar(this.client.clientId, file).subscribe({
        next: (response) => {
          console.log('Réponse de l\'upload :', response);

          // Vérification de la présence de l'avatar dans la réponse
          this.avatar = response.avatarPath;
          console.log('Avatar mis à jour :', this.avatar);
        },
        error: (err) => {
          console.error('Erreur lors de l\'upload de l\'avatar :', err);
          this.notification.error('Erreur lors du téléchargement de l\'avatar.');
        },
      });
    }
  }

  /**
   * Met à jour le profil du client.
   */
  updateProfile(): void {
    if (this.client && this.editForm) {
      // Appel API pour mettre à jour les informations du client
      this.clientService.updateProfile(this.client.clientId, this.editForm).subscribe({
        next: (updatedClient: any) => {
          if (updatedClient && updatedClient.user) {
            this.client = updatedClient; // Mise à jour des données du client
            this.editMode = false; // Désactivation du mode édition
          }

          // Ajout d'un délai avant rechargement de la page
          setTimeout(() => {
            window.location.reload(); // Recharge la page après 1 seconde
          }, 1000);

          this.notification.success('Profil mis à jour avec succès !');
          console.log(this.avatar);
        },
        error: (error) => {
          console.error('Erreur mise à jour profil:', error);
          this.notification.error('Erreur lors de la mise à jour du profil.');
        }
      });

      // Redirection après soumission du formulaire
      this.router.navigate(['/client/profile']);
      console.log('Redirection vers le profil.');
    }
  }
}
