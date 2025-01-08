import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export function DashboardGuard(isPublic: boolean = false, redirectRoute: string = ''): CanActivateFn {
  return () => {
    const isAuthenticated: boolean= true; // determine authentication status
    const router: Router = inject(Router);

    console.log('isPublic:', isPublic);
    console.log('isAuthenticated:', isAuthenticated);
    console.log('redirectRoute:', redirectRoute);

    if (isPublic) {
      if (!isAuthenticated) {
        return true;
      } else {
        return router.createUrlTree([redirectRoute]);
      }
    } else {
      if (isAuthenticated) {
        return true;
      } else {
        return router.createUrlTree([redirectRoute]);
      }
    }
  }
}
