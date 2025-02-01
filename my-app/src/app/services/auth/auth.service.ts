import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import {tap, catchError, map, switchMap} from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';


export interface Credential {
  credential_id: string;
  mail: string;
  isAdmin: boolean;
  username?: string;
  active: boolean;
  ban: boolean;
}

export interface LoginResponse {
  token_id: string;
  token: string;
  refreshToken: string;
  credential: Credential;
  clientId: number; // Ajout du clientId dans la réponse
}

interface SignupResponse {
  message: string;
  credential: Credential;
}

export interface LoginCredentials {
  mail: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  mail: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:2024/api';
  private readonly EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  private currentUserSubject = new BehaviorSubject<Credential | null>(null);
  private loginAttempts: { [key: string]: { count: number; lastAttempt: number } } = {};
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_TIME = 15 * 60 * 1000; // 15 minutes

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredUser();
  }

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

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value && !!localStorage.getItem('token');
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.isAdmin : false;
  }

  isBan(): boolean
  {
    const userBan = this.currentUserSubject.value;
    return userBan ? userBan.ban: false;
  }

  validateEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  // log en tant qu'utilisateur
  login(credentials: LoginCredentials): Observable<LoginResponse> {
    console.log('Tentative de connexion utilisateur:', credentials.mail);

    return this.http.post<LoginResponse>(`${this.API_URL}/account/signin`, credentials).pipe(
      tap(response => {
        if (!response || !response.token || !response.credential) {
          throw new Error('Réponse invalide');
        }

        if (response.credential.ban)
        {
          console.log("en règle");
        }else{
          console.log("Ce compte a été banni par un administrateur !")
        }
        console.log('Réponse utilisateur reçue:', response);
      }),
      catchError(error => {
        console.error('Erreur de connexion utilisateur:', error);
        return this.handleError(error); // Gestion des erreurs centralisée
      })
    );
  }

  // log en tant qu'admin
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
        return this.handleError(error); // Gestion des erreurs centralisée
      })
    );
  }

  // Pour Google login
  googleLogin(credential: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/account/google-login`, { credential }).pipe(
      tap((response: LoginResponse) => {
        // Vérification de l'état du compte
        if (response.credential.ban) {
          throw new Error('Votre compte est banni par un administrateur.');
        }

        if (!response.credential.active) {
          throw new Error('Votre compte est désactivé. Veuillez contacter le support.');
        }

        console.log('Connexion réussie avec Google:', response);

        // Sauvegarder les données comme pour une connexion normale
        this.saveAuthData(response);
      }),
      catchError(error => {
        console.error('Erreur lors de la connexion Google:', error);

        // Retourner une erreur lisible par l'utilisateur
        return throwError(() =>
          new Error(error.error?.message || 'Une erreur est survenue lors de la connexion avec Google.')
        );
      })
    );
  }

  signup(credentials: SignupCredentials): Observable<SignupResponse> {
    // On garde toutes les validations existantes
    if (!credentials.username || !credentials.mail || !credentials.password) {
      return throwError(() => new Error('Tous les champs sont obligatoires'));
    }

    if (!this.validateEmail(credentials.mail)) {
      return throwError(() => new Error('Format d\'email invalide'));
    }

    if (credentials.password.length < 8) {
      return throwError(() => new Error('Le mot de passe doit contenir au moins 8 caractères'));
    }

    // On ajoute juste la vérification d'email existant AVANT l'inscription
    return this.checkUserExists(credentials.mail).pipe(
      switchMap(exists => {
        if (exists) {
          return throwError(() => ({
            status: 409,
            message: 'Cet email est déjà utilisé'
          }));
        }

        // Le reste du code reste exactement le même
        return this.http.post<SignupResponse>(`${this.API_URL}/account/signup`, credentials).pipe(
          tap(response => console.log('Inscription réussie:', response)),
          catchError(this.handleError)
        );
      })
    );
  }

  checkUserExists(email: string): Observable<boolean> {
    if (!this.validateEmail(email)) {
      return throwError(() => new Error('Format d\'email invalide'));
    }

    return this.http.get<{ exists: boolean }>(`${this.API_URL}/account/check-email/${email}`).pipe(
      map(response => response.exists),
      catchError(error => {
        console.error('Erreur vérification email:', error);
        // En cas d'erreur, on continue avec le login
        return of(true);
      })
    );
  }

  verifyToken(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      return throwError(() => new Error('Non authentifié'));
    }

    return this.http.get<{ valid: boolean }>(`${this.API_URL}/account/verify-token`).pipe(
      map(() => true),
      catchError(() => {
        this.logout();
        return throwError(() => new Error('Token invalide'));
      })
    );
  }

  refreshToken(): Observable<{ token: string; refreshToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      this.logout();
      return throwError(() => new Error('Refresh token non trouvé'));
    }

    return this.http.post<{ token: string; refreshToken: string }>(
      `${this.API_URL}/account/refresh-token`,
      { refreshToken }
    ).pipe(
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

  public async saveAuthData(response: LoginResponse): Promise<void> {
    console.log('Début saveAuthData:', response);

    try {
      // Sauvegarder le token et le refresh token
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('clientId', response?.clientId.toString());

      // Sauvegarder les informations de l'utilisateur
      localStorage.setItem('user', JSON.stringify(response.credential));


      this.currentUserSubject.next(response.credential);
    } catch (error) {
      console.error('Erreur dans saveAuthData:', error);
      throw error;
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('clientId'); // Suppression de l'ID client
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.clearAuthData();
  }

  private handleError(error: HttpErrorResponse) {
    console.error('Erreur interceptée:', error);

    let errorMessage = 'Une erreur est survenue';

    if (error.error) {
      if (typeof error.error === 'string') {
        // Le backend renvoie une chaîne brute (HTML, texte ou autre)
        errorMessage = error.error;
      } else if (typeof error.error === 'object' && error.error.message) {
        // Le backend renvoie un objet avec un champ "message"
        errorMessage = error.error.message;
      }
    } else if (error.status) {
      // Erreur sans corps mais avec un statut HTTP
      errorMessage = `Erreur inconnue. Code HTTP: ${error.status}`;
    } else {
      // Aucune information disponible
      errorMessage = 'Erreur inattendue sans détails';
    }

    return throwError(() => new Error(errorMessage));
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
