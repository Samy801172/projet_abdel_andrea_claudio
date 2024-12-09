// guards/client.guard.ts
import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';

export const clientGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  if (!user.credential_id) {
    router.navigate(['/login']);
    return false;
  }

  if (user.isAdmin) {
    router.navigate(['/admin-dashboard']);
    return false;
  }

  return true;
};
