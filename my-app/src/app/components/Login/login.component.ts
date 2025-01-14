import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, LoginResponse } from '../../services/auth/auth.service';
import { NotificationService } from '../../services/notification/notification.service';
import { GoogleLoginComponent } from '../google-login/google-login.component'; // Assurez-vous que le chemin est correct
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, GoogleLoginComponent],
  templateUrl: 'login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  credentials = {
    mail: '',
    password: ''
  };

  isLoading = false;
  error = '';
  showPassword = false;
  submitted = false;
  currentYear = new Date().getFullYear();

  constructor(
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {}

  async onSubmit() {
    let response: LoginResponse;

    try {
      this.isLoading = true;
      this.submitted = true;
      this.error = '';

      // Validation des champs
      if (!this.credentials.mail || !this.credentials.password) {
        this.error = 'Veuillez remplir tous les champs';
        this.notification.error(this.error);
        return;
      }

      if (!this.authService.validateEmail(this.credentials.mail)) {
        this.error = 'Format d\'email invalide';
        this.notification.error(this.error);
        return;
      }

      // Tentative de connexion utilisateur classique
      try {
        response = await firstValueFrom(this.authService.login(this.credentials));
        console.log('Connexion réussie en tant qu\'utilisateur');
      } catch (userError) {
        console.warn('Échec de la connexion utilisateur. Tentative de connexion administrateur.', userError);

        // Tentative de connexion administrateur si l'utilisateur échoue
        response = await firstValueFrom(this.authService.adminLogin(this.credentials));
        console.log('Connexion réussie en tant qu\'administrateur');
      }

      // Vérification de la réponse
      if (!response || !response.token || !response.credential) {
        throw new Error('Connexion échouée : réponse invalide');
      }

      // Sauvegarder les données d'authentification
      this.authService.saveAuthData(response);

      // Redirection selon le rôle
      if (response.credential.isAdmin) {
        this.notification.success("Connecté en tant qu'administrateur");
      } else {
        this.notification.success("Connecté en tant qu'utilisateur");
      }

      // Redirection avec rafraîchissement
      this.router.navigate(['/']).then(() => {
        window.location.reload();
      });

    } catch (error) {
      // Gérer les erreurs de connexion
      this.error = error instanceof Error ? error.message : 'Une erreur est survenue lors de la connexion';
      this.notification.error(this.error);
      console.error('Erreur de connexion:', error);
    } finally {
      this.isLoading = false;
    }
  }



}
