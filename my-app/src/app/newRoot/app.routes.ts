import { Routes } from '@angular/router';
import { LoginComponent } from '../components/Login/login.component';
import { RegisterComponent } from '../components/Register/register.component';
import { NoAuthGuard } from '../feature/dashboard/guard/no-auth.guard';
import { AuthGuard } from '../feature/dashboard/guard/auth.guard';
import { AdminGuard } from '../feature/dashboard/guard/admin.guard';
import { HomeComponent } from '../components/home/home.component';
import {OrderConfirmationComponent} from '../components/order-confirmation/order-confirmation.component';
import {PaymentSuccessComponent} from '../components/payment/payment-success.component';
import {ClientProfileComponent} from '../feature/dashboard/DashboardComponent/client/profile/client-profile.component';
import { ManufacturingRequestComponent } from '../components/manufacturing/manufacturing-request/manufacturing-request.component';
import { ManufacturingPaymentComponent } from '../components/manufacturing/manufacturing-payment/manufacturing-payment.component';
import { ManufacturingListComponent } from '../components/manufacturing/manufacturing-list/manufacturing-list.component';
import { ManufacturingConfirmationComponent } from '../components/manufacturing/manufacturing-confirmation/manufacturing-confirmation.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
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
    path: 'admin',
    loadChildren: () => import('../feature/dashboard/DashboardComponent/admin/admin.routes')
      .then(m => m.adminRoutes),
    canActivate: [AuthGuard, AdminGuard]
  },

  // Routes de fabrication
  {
    path: 'client/manufacturing/request',
    component: ManufacturingRequestComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manufacturing/payment/:id',
    component: ManufacturingPaymentComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manufacturing/list',
    component: ManufacturingListComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'manufacturing/confirmation/:id',
    component: ManufacturingConfirmationComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'payment/success',
    component: PaymentSuccessComponent,
    canActivate: [AuthGuard]
  }
];
