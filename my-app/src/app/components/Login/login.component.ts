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
    try {
      this.isLoading = true;
      this.submitted = true;
      this.error = '';

      // Validation des champs
      if (!this.credentials.mail || !this.credentials.password) {
        this.error = 'Veuillez remplir tous les champs';
        return;
      }

      if (!this.authService.validateEmail(this.credentials.mail)) {
        this.error = 'Format d\'email invalide';
        return;
      }

      // Tentative de connexion
      const response: LoginResponse = await firstValueFrom(
        this.authService.login(this.credentials)
      );

      // Vérification du rôle de l'utilisateur et redirection
      if (response.credential.isAdmin) {
        this.router.navigate(['/admin']);
        this.notification.success("Connecté en tant qu'administrateur");
      } else {
        this.router.navigate(['/client']);
        this.notification.success("Connecté en tant qu'utilisateur");
      }
    } catch (error) {
      // Gérer les erreurs de connexion
      this.error = error instanceof Error
        ? error.message
        : 'Une erreur est survenue lors de la connexion';
      console.error('Erreur de connexion:', error);
      this.notification.error(this.error);
    } finally {
      this.isLoading = false;
    }
  }
}
