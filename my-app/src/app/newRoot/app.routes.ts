import { Routes } from '@angular/router';
import { LoginComponent } from '../components/Login/login.component';
import { RegisterComponent } from '../components/Register/register.component';
import { NoAuthGuard } from '../feature/Dashboard/guard/no-auth.guard';
import { AuthGuard } from '../feature/Dashboard/guard/auth.guard';
import { AdminGuard } from '../feature/Dashboard/guard/admin.guard';
import { HomeComponent } from '../components/Home/home.component';
import {OrderConfirmationComponent} from '../components/order-confirmation/order-confirmation.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'order-confirmation/:id',
    component: OrderConfirmationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [NoAuthGuard]
  },
  {
    path: 'client',
    loadChildren: () => import('../feature/Dashboard/DashboardComponent/client/client.routes')
      .then(m => m.clientRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'admin',
    loadChildren: () => import('../feature/Dashboard/DashboardComponent/admin/admin.routes')
      .then(m => m.adminRoutes),
    canActivate: [AuthGuard, AdminGuard]
  }
];
