import { Routes } from '@angular/router';
import { LoginComponent } from '../components/Login/login.component';
import { RegisterComponent } from '../components/Register/register.component';
import { NoAuthGuard } from '../feature/dashboard/guard/no-auth.guard';
import { AuthGuard } from '../feature/dashboard/guard/auth.guard';
import { AdminGuard } from '../feature/dashboard/guard/admin.guard';
import { HomeComponent } from '../components/home/home.component';
import {OrderConfirmationComponent} from '../components/order-confirmation/order-confirmation.component';
import {StockManagementComponent} from '../feature/dashboard/DashboardComponent/admin/stock/stock-management.component';
import {PaymentSuccessComponent} from '../components/payment/payment-success.component';
import {ClientProfileComponent} from '../feature/dashboard/DashboardComponent/client/profile/client-profile.component';


export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'payment-success',

  component: OrderConfirmationComponent,
  canActivate: [AuthGuard]
  },
  {
    path: 'admin/stock',
    component: StockManagementComponent,
    canActivate: [AuthGuard, AdminGuard]
  },

  { path: 'profile',
    component: ClientProfileComponent,
    canActivate: [AuthGuard]
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
    loadChildren: () => import('../feature/dashboard/DashboardComponent/client/client.routes')
      .then(m => m.clientRoutes),
    canActivate: [AuthGuard]
  },
  {
    path: 'payment-success',
    component: PaymentSuccessComponent
  },
  {
    path: 'admin',
    loadChildren: () => import('../feature/dashboard/DashboardComponent/admin/admin.routes')
      .then(m => m.adminRoutes),
    canActivate: [AuthGuard, AdminGuard]
  }
];
