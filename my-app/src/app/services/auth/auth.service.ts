import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface Credential {
  credential_id: string;
  mail: string;
  isAdmin: boolean;
  username?: string;
}

export interface LoginResponse {
  token_id: string;
  token: string;
  refreshToken: string;
  credential: Credential;
  clientId?: number; // Ajout du clientId dans la réponse
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
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:2024/api';
  private readonly EMAIL_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  private currentUserSubject = new BehaviorSubject<Credential | null>(null);

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    try {
      const storedUser = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      if (storedUser && token && refreshToken) {
        this.currentUserSubject.next(JSON.parse(storedUser));
      } else {
        this.clearAuthData();
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
      this.clearAuthData();
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    return !!token && !!refreshToken && !!this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  isAdmin(): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.isAdmin : false;
  }

  // pour Google login
  googleLogin(credential: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/account/google-login`, { credential }).pipe(
      tap((response: LoginResponse) => {
        console.log('Connexion réussie avec Google:', response);
        this.saveAuthData(response); // Sauvegarder les données comme pour une connexion normale
      }),
      catchError(error => {
        console.error('Erreur lors de la connexion Google:', error);
        return this.handleError(error);
      })
    );
  }



  validateEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    console.log('Tentative de connexion pour:', credentials.mail);

    if (!this.validateEmail(credentials.mail)) {
      return throwError(() => new Error('Format d\'email invalide'));
    }

    // Tente d'abord la connexion en tant que client
    return this.http.post<LoginResponse>(`${this.API_URL}/account/signin`, credentials).pipe(
      tap(response => {
        if (!response || !response.token || !response.credential) {
          throw new Error('Réponse invalide du serveur (client)');
        }
        console.log('Utilisateur connecté en tant que client:', response);
        this.saveAuthData(response); // Sauvegarde les données pour les clients
      }),
      catchError(clientError => {
        console.error('Échec de la connexion en tant que client:', clientError);

        // Si la connexion client échoue, tente la connexion en tant qu'administrateur
        return this.http.post<LoginResponse>(`${this.API_URL}/account/admin-signin`, credentials).pipe(
          tap(response => {
            if (!response || !response.token || !response.credential) {
              throw new Error('Réponse invalide du serveur (admin)');
            }
            console.log('Utilisateur connecté en tant qu\'administrateur:', response);
            this.saveAuthData(response); // Sauvegarde les données pour les administrateurs
          }),
          catchError(adminError => {
            console.error('Échec de la connexion en tant qu\'administrateur:', adminError);
            return throwError(() => new Error('Veuillez vérifier vos informations de connexions.'));
          })
        );
      })
    );
  }



  signup(credentials: SignupCredentials): Observable<SignupResponse> {
    console.log('Tentative d\'inscription pour:', credentials.mail);

    if (!this.validateEmail(credentials.mail)) {
      return throwError(() => new Error('Format d\'email invalide'));
    }

    if (credentials.password.length < 8) {
      return throwError(() => new Error('Le mot de passe doit contenir au moins 8 caractères'));
    }

    return this.http.post<SignupResponse>(`${this.API_URL}/account/signup`, credentials).pipe(
      tap(response => {
        console.log('Inscription réussie:', response);
      }),
      catchError(error => {
        console.error('Erreur lors de l\'inscription:', error);
        return this.handleError(error);
      })
    );
  }

  refreshToken(): Observable<{ token: string; refreshToken: string }> {
    const currentRefreshToken = localStorage.getItem('refreshToken');
    if (!currentRefreshToken) {
      this.clearAuthData();
      return throwError(() => new Error('Refresh token non trouvé'));
    }

    return this.http.post<{ token: string; refreshToken: string }>(
      `${this.API_URL}/account/refresh-token`,
      { refreshToken: currentRefreshToken }
    ).pipe(
      tap(response => {
        if (!response.token || !response.refreshToken) {
          throw new Error('Réponse invalide du serveur pour le refresh token');
        }
        localStorage.setItem('token', response.token);
        localStorage.setItem('refreshToken', response.refreshToken);
      }),
      catchError(error => {
        console.error('Erreur lors du refresh token:', error);
        this.clearAuthData();
        return this.handleError(error);
      })
    );
  }

  private saveAuthData(response: LoginResponse): void {
    try {
      if (!response.token || !response.refreshToken || !response.credential) {
        throw new Error('Données d\'authentification invalides');
      }
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.credential));
      this.currentUserSubject.next(response.credential);
    } catch (error) {
      console.error('Erreur dans saveAuthData:', error);
      this.clearAuthData();
      throw error;
    }
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  logout(): void {
    this.clearAuthData();
    this.router.navigate(['/login']);
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      switch (error.status) {
        case 400:
          errorMessage = error.error.message || 'Données invalides';
          break;
        case 401:
          errorMessage = 'Email ou mot de passe incorrect';
          break;
        case 403:
          errorMessage = 'Accès non autorisé';
          break;
        case 404:
          errorMessage = 'Utilisateur non trouvé';
          break;
        case 429:
          errorMessage = 'Trop de tentatives. Veuillez réessayer plus tard';
          break;
        default:
          errorMessage = 'Erreur lors de la connexion';
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
