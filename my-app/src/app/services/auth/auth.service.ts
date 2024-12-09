import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import {tap, catchError, map, switchMap} from 'rxjs/operators';

export interface Credential {
  credential_id: string;
  mail: string;
  isAdmin: boolean;
  username?: string;
}

interface LoginResponse {
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

  validateEmail(email: string): boolean {
    return this.EMAIL_REGEX.test(email);
  }

  login(credentials: LoginCredentials): Observable<LoginResponse> {
    console.log('Tentative de connexion pour:', credentials.mail);

    if (!this.validateEmail(credentials.mail)) {
      return throwError(() => new Error('Format d\'email invalide'));// 
    }

    return this.http.post<LoginResponse>(`${this.API_URL}/account/signin`, {
      mail: credentials.mail,
      password: credentials.password
    }).pipe(
      tap(response => {
        console.log('Réponse de connexion reçue:', response);
        this.saveAuthData(response);
      }),
      catchError(error => {
        console.error('Erreur de connexion:', error);
        return this.handleError(error);
      })
    );
  }

  adminLogin(credentials: LoginCredentials): Observable<LoginResponse> {
    console.log('Tentative de connexion admin pour:', credentials.mail);

    if (!this.validateEmail(credentials.mail)) {
      return throwError(() => new Error('Format d\'email invalide'));
    }

    return this.http.post<LoginResponse>(`${this.API_URL}/account/admin-signin`, {
      mail: credentials.mail,
      password: credentials.password
    }).pipe(
      tap(response => {
        console.log('Réponse de connexion admin reçue:', response);
        if (!response.credential.isAdmin) {
          throw new Error('Accès non autorisé');
        }
        this.saveAuthData(response);
      }),
      catchError(error => {
        console.error('Erreur de connexion admin:', error);
        return this.handleError(error);
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

  private checkLoginAttempts(email: string): boolean {
    const now = Date.now();
    const attempts = this.loginAttempts[email];

    if (attempts) {
      if (attempts.count >= this.MAX_ATTEMPTS) {
        const timeElapsed = now - attempts.lastAttempt;
        if (timeElapsed < this.LOCK_TIME) {
          const remainingTime = Math.ceil((this.LOCK_TIME - timeElapsed) / 1000 / 60);
          throw new Error(`Compte temporairement bloqué. Réessayez dans ${remainingTime} minutes`);
        } else {
          delete this.loginAttempts[email];
        }
      }
    }
    return true;
  }

  private incrementLoginAttempts(email: string): void {
    if (!this.loginAttempts[email]) {
      this.loginAttempts[email] = { count: 0, lastAttempt: Date.now() };
    }
    this.loginAttempts[email].count++;
    this.loginAttempts[email].lastAttempt = Date.now();
  }

  private saveAuthData(response: LoginResponse): void {
    console.log('Début saveAuthData:', response);

    try {
      // Sauvegarder le token et le refresh token
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Sauvegarder les informations de l'utilisateur
      localStorage.setItem('user', JSON.stringify(response.credential));

      // Rechercher et sauvegarder le clientId
      this.findAndSaveClientId(response.credential.credential_id);

      this.currentUserSubject.next(response.credential);
    } catch (error) {
      console.error('Erreur dans saveAuthData:', error);
      throw error;
    }
  }
  private async findAndSaveClientId(credentialId: string): Promise<void> {
    try {
      const client = await this.http.get<any>(`${this.API_URL}/clients/credential/${credentialId}`)
        .toPromise();

      if (client && client.clientId) {
        localStorage.setItem('clientId', client.clientId.toString());
        console.log('ClientId sauvegardé:', client.clientId);
      } else {
        console.error('ClientId non trouvé dans la réponse');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du clientId:', error);
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

    console.error('Erreur:', error);
    return throwError(() => new Error(errorMessage));
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }
}
