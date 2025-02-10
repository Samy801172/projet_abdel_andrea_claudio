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
import { ManufacturingManagementComponent } from '../feature/dashboard/DashboardComponent/admin/manufacturing/manufacturing-management.component';
import { ManufacturingPaymentComponent } from '../feature/dashboard/DashboardComponent/manufacturing/manufacturing-payment.component';
import { ManufacturingDetailsComponent } from '../components/manufacturing-details/manufacturing-details.component';
import { CustomManufacturingComponent } from '../feature/dashboard/DashboardComponent/manufacturing/custom-manufacturing.component';

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
    path: 'manufacturing',
    children: [
      {
        path: 'custom',
        component: CustomManufacturingComponent,
        canActivate: [AuthGuard]
      },
      {
        path: ':id',
        component: ManufacturingDetailsComponent,
        canActivate: [AuthGuard]
      },
      {
        path: ':id/payment',
        component: ManufacturingPaymentComponent,
        canActivate: [AuthGuard]
      }
    ]
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
