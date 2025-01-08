import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const router = inject(Router);
  const authService = inject(AuthService);

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    return next(clonedReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          // Tentative de rafraîchissement du token
          return authService.refreshToken().pipe(
            switchMap((response) => {
              if (response?.token) {
                console.log('Token rafraîchi avec succès:', response.token);

                // Stocker le nouveau token
                localStorage.setItem('token', response.token);

                // Recréer la requête avec le nouveau token
                const newReq = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${response.token}`,
                  },
                });
                return next(newReq);
              } else {
                console.error('Réponse invalide lors du rafraîchissement du token.');
                authService.logout();
                router.navigate(['/login']);
                return throwError(() => new Error('Rafraîchissement du token échoué.'));
              }
            }),
            catchError((refreshError) => {
              console.error('Erreur lors du rafraîchissement du token:', refreshError);
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => refreshError);
            })
          );
        }

        return throwError(() => error);
      })
    );
  }

  return next(req);
};
