// admin.routes.ts
import { Routes } from '@angular/router';
import { AdminOrdersComponent } from './orders/admin-orders.component';
import { AdminClientsComponent } from './clients/admin-clients.component';
import { AdminServicesComponent } from './services/admin-service.component';
import { AdminAppointmentsComponent } from './appointments/admin-appointments.component';
import { AdminProductFormComponent } from './products/product-form/admin-product-form.component';
import { AdminProductsComponent } from './products/admin-products.component';
import { AdminTypeFormComponent } from './type/type-form/admin-type-form.component';
import { AdminTypesComponent } from './type/admin-types.component';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { AdminDashComponent } from './dash/admin-dash.component';
import {StockManagementComponent} from "./stock/stock-management.component";
import {AuthGuard} from "../../guard/auth.guard";
import {AdminGuard} from "../../guard/admin.guard";
import {PromotionComponent} from "../../../../components/Promotion/promotion.component";
import {AdminPromotionsComponent} from "./promotions/admin-promotions.component";
import {AdminPrescriptionsComponent} from "./prescriptions/admin-prescriptions.component";


export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminDashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'types',
        pathMatch: 'full'
      },
      {
        path: 'dash',
        component: AdminDashComponent
      },
      {
        path: 'stock',
        component: StockManagementComponent,
        canActivate: [AuthGuard, AdminGuard]
      },
      {
        path: 'categories',
        component: AdminTypesComponent
      },
      {
        path: 'types/add',
        component: AdminTypeFormComponent
      },
      {
        path: 'types/edit/:id',
        component: AdminTypeFormComponent
      },
      {
        path: 'products',
        component: AdminProductsComponent
      },
      {
        path: 'products/add',
        component: AdminProductFormComponent
      },
      {
        path: 'products/edit/:id',
        component: AdminProductFormComponent
      },
      {
        path: 'orders',
        component: AdminOrdersComponent,
      },
      {
        path: 'clients',
        component: AdminClientsComponent
      },
      {
        path: 'services',
        component: AdminServicesComponent
      },
      {
        path: 'appointments',
        component: AdminAppointmentsComponent
      },
      {
        path: 'promotions',
        component: AdminPromotionsComponent
      },
      {
        path: 'prescriptions',
        component: AdminPrescriptionsComponent
      }
    ]
  }
];
