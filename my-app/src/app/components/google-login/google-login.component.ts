import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router'; // Importer Router pour les redirections

@Component({
  selector: 'app-google-login',
  standalone: true,
  template: `<div id="google-login-button"></div>`,
  styles: [`
    #google-login-button {
      display: inline-block;
      margin: 1rem auto;
    }
  `]
})
export class GoogleLoginComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {} // Injecter Router

  ngOnInit(): void {
    google.accounts.id.initialize({
      client_id: '895412895151-8h0gn8669voga5e58rmqbibu01bd9v9d.apps.googleusercontent.com',
      callback: (response: { credential: string }) => this.handleCredentialResponse(response),
    });

    google.accounts.id.renderButton(
      document.getElementById('google-login-button')!,
      {
        theme: 'outline',
        size: 'large',
      }
    );
  }

  handleCredentialResponse(response: any): void {
    this.authService.googleLogin(response.credential).subscribe({
      next: () => {
        console.log('Connexion réussie avec Google');
        this.router.navigate(['/']); // Rediriger vers la page d'accueil
      },
      error: err => console.error('Erreur de connexion Google:', err),
    });
  }
}
