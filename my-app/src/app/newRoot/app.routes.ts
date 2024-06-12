import { Routes } from '@angular/router';
import { AppNode } from '@shared-router';
import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { CommonModule } from '@angular/common';
const TestGuard: CanActivateFn = () => {const isAuthenticated: boolean = true;
const router: Router = inject(Router);

  console.log('isAuthenticated:', isAuthenticated);

  return isAuthenticated || router.createUrlTree([AppNode.PUBLIC]);
};

export const routes: Routes = [
  {
    path: '',
    redirectTo: AppNode.PUBLIC,
    pathMatch: 'full'
  },
  {
    path: AppNode.PUBLIC,
    loadChildren: () => import('../feature/security/security.routes').then(m => m.securityRoutes)
  },
  {
    path: '**',
    redirectTo: AppNode.PUBLIC,
    pathMatch: 'full'
  }
];
