import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router'; // Importer Router pour les redirections

@Component({
  selector: 'app-google-login', // Définit le sélecteur HTML pour ce composant
  standalone: true, // Permet d'utiliser ce composant indépendamment d'un module Angular
  template: `<div id="google-login-button"></div>`, // Élément HTML où le bouton Google sera rendu
  styles: [`
    #google-login-button {
      display: inline-block;
      margin: 1rem auto; // Ajoute une marge autour du bouton
    }
  `]
})
export class GoogleLoginComponent implements OnInit {
  constructor(private authService: AuthService, private router: Router) {} // Injecte les services nécessaires

  ngOnInit(): void {
    // Initialise le système de connexion Google avec l'ID client
    google.accounts.id.initialize({
      client_id: '895412895151-8h0gn8669voga5e58rmqbibu01bd9v9d.apps.googleusercontent.com', // Remplace par ton propre client ID
      callback: (response: { credential: string }) => this.handleCredentialResponse(response), // Déclenché après l'authentification
    });

    // Rend le bouton Google sur l'élément HTML défini
    google.accounts.id.renderButton(document.getElementById('google-login-button')!, {
      theme: 'outline', // Apparence du bouton (clair)
      size: 'large', // Taille du bouton
    });
  }

  // Méthode appelée lorsque Google renvoie une réponse après connexion
  handleCredentialResponse(response: any): void {
    this.authService.googleLogin(response.credential).subscribe({
      next: () => {
        console.log('Connexion réussie avec Google');
        // Redirige vers la page d'accueil et force un rechargement pour mettre à jour l'état de connexion
        this.router.navigate(['/']).then(() => {
          window.location.reload(); // Rafraîchissement complet de la page pour recharger les données utilisateur
        });
      },
      error: (err) => console.error('Erreur de connexion Google:', err), // Gestion des erreurs en cas d'échec de la connexion
    });
  }
}
