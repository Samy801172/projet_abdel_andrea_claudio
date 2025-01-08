// register.component.ts
import { Component } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router, RouterModule} from '@angular/router';
import {AuthService} from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgOptimizedImage], // Important d'ajouter FormsModule
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  user = {
    username: '',
    mail: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    address: ''
  };

  error = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    // On garde toutes les vérifications existantes
    if (this.user.password !== this.user.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    const signupPayload = {
      username: this.user.username,
      mail: this.user.mail,
      password: this.user.password,
      googleHash: '',
      facebookHash: ''
    };

    // La seule chose qui change c'est le message d'erreur
    this.authService.signup(signupPayload).subscribe({
      next: (response) => {
        console.log('Inscription réussie:', response);
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Erreur inscription:', error);
        // On personnalise juste le message d'erreur
        this.error = error.status === 409
          ? 'Cet email est déjà utilisé. Veuillez en choisir un autre ou vous connecter.'
          : 'Erreur lors de l\'inscription';
      }
    });
  }
}
