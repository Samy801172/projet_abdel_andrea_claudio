import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { tap, catchError, map, switchMap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

// Interface définissant les informations d'identification d'un utilisateur
export interface Credential {
  credential_id: string;
  mail: string;
  isAdmin: boolean;
  username?: string;
  active: boolean;
  ban: boolean;
}

// Interface définissant la réponse lors d'une connexion
export interface LoginResponse {
  token_id: string;
  token: string;
  refreshToken: string;
  credential: Credential;
  clientId: number; // Ajout du clientId dans la réponse
}

// Interface définissant la réponse lors d'une inscription
interface SignupResponse {
  message: string;
  credential: Credential;
}

// Interface pour les informations de connexion
export interface LoginCredentials {
  mail: string;
  password: string;
}

// Interface pour les informations d'inscription
export interface SignupCredentials {
  username: string;
  mail: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:2024/api'; // URL de l'API backend
  private readonly EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; // Regex pour valider un email
  private currentUserSubject = new BehaviorSubject<Credential | null>(null); // Stocke l'utilisateur actuel
  private loginAttempts: { [key: string]: { count: number; lastAttempt: number } } = {}; // Suivi des tentatives de connexion
  private readonly MAX_ATTEMPTS = 5; // Nombre maximum de tentatives avant verrouillage
  private readonly LOCK_TIME = 15 * 60 * 1000; // Temps de verrouillage en millisecondes (15 min)

  currentUser$ = this.currentUserSubject.asObservable(); // Observable pour suivre l'utilisateur connecté

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser(); // Charge l'utilisateur sauvegardé au démarrage
  }

  // Charge l'utilisateur sauvegardé dans le localStorage
  private loadStoredUser(): void {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      this.logout();
    }
  }

  // Vérifie si un utilisateur est connecté
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value && !!localStorage.getItem('token');
  }

  // Vérifie si l'utilisateur connecté est un administrateur
  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.isAdmin : false;
  }

  // Vérifie si l'utilisateur est banni
  isBan(): boolean {
    const userBan = this.currentUserSubject.value;
    return userBan ? userBan.ban : false;
  }

  // Valide si un email a un format correct
  validateEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  // Connexion utilisateur standard
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    console.log('Tentative de connexion utilisateur:', credentials.mail);

    return this.http.post<LoginResponse>(`${this.API_URL}/account/signin`, credentials).pipe(
      tap(response => {
        if (!response || !response.token || !response.credential) {
          throw new Error('Réponse invalide');
        }

        if (response.credential.ban) {
          console.log("en règle");
        } else {
          console.log("Ce compte a été banni par un administrateur !");
        }
        console.log('Réponse utilisateur reçue:', response);
      }),
      catchError(error => {
        console.error('Erreur de connexion utilisateur:', error);
        return this.handleError(error); // Gestion des erreurs centralisée
      })
    );
  }

  // Connexion administrateur
  adminLogin(credentials: LoginCredentials): Observable<LoginResponse> {
    console.log('Tentative de connexion administrateur:', credentials.mail);

    return this.http.post<LoginResponse>(`${this.API_URL}/account/admin-signin`, credentials).pipe(
      tap(response => {
        if (!response || !response.token || !response.credential || !response.credential.isAdmin) {
          throw new Error('Accès non autorisé pour un utilisateur non administrateur');
        }
        console.log('Réponse administrateur reçue:', response);
      }),
      catchError(error => {
        console.error('Erreur de connexion administrateur:', error);
        return this.handleError(error);
      })
    );
  }

  // Connexion avec Google
  googleLogin(credential: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/account/google-login`, { credential }).pipe(
      tap(response => {
        if (response.credential.ban) {
          throw new Error('Votre compte est banni par un administrateur.');
        }
        if (!response.credential.active) {
          throw new Error('Votre compte est désactivé. Veuillez contacter le support.');
        }
        console.log('Connexion réussie avec Google:', response);
        this.saveAuthData(response);
      }),
      catchError(error => {
        console.error('Erreur lors de la connexion Google:', error);
        return throwError(() => new Error(error.error?.message || 'Une erreur est survenue.'));
      })
    );
  }

  // Inscription utilisateur
  signup(credentials: SignupCredentials): Observable<SignupResponse> {
    return this.http.post<SignupResponse>(`${this.API_URL}/account/signup`, credentials).pipe(
      tap(response => console.log('Inscription réussie:', response)),
      catchError(this.handleError)
    );
  }

  // Vérifie si un email existe déjà
  checkUserExists(email: string): Observable<boolean> {
    return this.http.get<{ exists: boolean }>(`${this.API_URL}/account/check-email/${email}`).pipe(
      map(response => response.exists),
      catchError(error => {
        console.error('Erreur vérification email:', error);
        return of(true);
      })
    );
  }

  // Vérifie si le token utilisateur est valide
  verifyToken(): Observable<boolean> {
    return this.http.get<{ valid: boolean }>(`${this.API_URL}/account/verify-token`).pipe(
      map(() => true),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('Token invalide'));
      })
    );
  }

  // Rafraîchit le token utilisateur
  refreshToken(): Observable<{ token: string; refreshToken: string }> {
    return this.http.post<{ token: string; refreshToken: string }>(`${this.API_URL}/account/refresh-token`, {}).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  // Sauvegarde les données d'authentification
  public async saveAuthData(response: LoginResponse): Promise<void> {
    try {
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('clientId', response.clientId.toString());
      localStorage.setItem('user', JSON.stringify(response.credential));
      this.currentUserSubject.next(response.credential);
    } catch (error) {
      console.error('Erreur dans saveAuthData:', error);
      throw error;
    }
  }

  // Supprime les données d'authentification stockées
  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('clientId');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Déconnexion de l'utilisateur
  logout(): void {
    this.clearAuthData();
  }

  // Gestion centralisée des erreurs HTTP
  private handleError(error: HttpErrorResponse) {
    console.error('Erreur interceptée:', error);
    return throwError(() => new Error(error.error?.message || 'Veuillez vérifier vos informations de connexion'));
  }

  // Vérifie si l'utilisateur est authentifié
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
