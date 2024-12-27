import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
  isAdminMode = false;
  currentYear = new Date().getFullYear();

  constructor(private authService: AuthService, private router: Router) {}

  async onSubmit() {
    try {
      this.isLoading = true;
      this.submitted = true;
      this.error = '';

      if (!this.credentials.mail || !this.credentials.password) {
        this.error = 'Veuillez remplir tous les champs';
        return;
      }

      if (!this.authService.validateEmail(this.credentials.mail)) {
        this.error = 'Format d\'email invalide';
        return;
      }

      // Vérifier d'abord si l'utilisateur existe
      const userExists = await firstValueFrom(this.authService.checkUserExists(this.credentials.mail));

      if (!userExists) {
        this.error = "Cet utilisateur n'existe pas. Veuillez vous inscrire.";
        this.isLoading = false;
        return;
      }

      // Continuer avec la connexion si l'utilisateur existe
      const loginObservable = this.isAdminMode
        ? this.authService.adminLogin(this.credentials)
        : this.authService.login(this.credentials);

      await firstValueFrom(loginObservable);

      // Rediriger après une connexion réussie
      if (this.isAdminMode) {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate(['/client']);
      }

    } catch (error) {
      this.error = error instanceof Error
        ? error.message
        : 'Une erreur est survenue lors de la connexion';
      console.error('Erreur de connexion:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onAdminModeChange() {
    this.error = '';
    this.credentials = {
      mail: '',
      password: ''
    };
    this.submitted = false;
  }
}
