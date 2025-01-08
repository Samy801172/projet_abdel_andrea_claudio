// feature/Dashboard/guard/admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): boolean {
    console.log('AdminGuard - Checking admin rights');
    console.log('Is Admin?', this.authService.isAdmin());
    console.log('Current User:', this.authService.currentUser$);

    if (!this.authService.isAdmin()) {
      console.log('Access denied - redirecting to unauthorized');
      this.router.navigate(['/unauthorized']);
      return false;
    }

    console.log('Admin access granted');
    return true;
  }
}
