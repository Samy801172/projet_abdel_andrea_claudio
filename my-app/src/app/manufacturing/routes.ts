import { Routes } from '@angular/router';
import { CustomManufacturingComponent } from './components/custom-manufacturing/custom-manufacturing.component';
import { authGuard } from '../feature/Dashboard/guard/auth.guard';

export const MANUFACTURING_ROUTES: Routes = [
  {
    path: 'manufacturing',
    children: [
      {
        path: 'custom',
        component: CustomManufacturingComponent,
        canActivate: [authGuard]
      }
    ]
  }
]; 