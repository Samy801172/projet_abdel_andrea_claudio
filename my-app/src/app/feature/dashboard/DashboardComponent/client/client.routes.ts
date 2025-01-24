// feature/Dashboard/DashboardComponent/client/client.routes.ts
import { Routes } from '@angular/router';
import { ClientDashboardComponent } from './client-dashboard.component';
import { ClientProfileComponent } from './profile/client-profile.component';

import { ProductDetailComponent } from '../../../../components/Product/product-detail.component';
import { CartComponent } from '../../../../components/Cart/cart.component';
import { ClientProductsComponent } from './Products/client-products.component';
import {CheckoutComponent} from '../../../../components/checkout/checkout.component';
import {AuthGuard} from '../../guard/auth.guard';
import {ClientOrderDetailComponent} from './orders/client-order-detail.component';
import {ClientOrdersComponent} from './orders/client-orders.component';
import {ClientAppointmentsComponent} from "./appointments/client-appointments.component";
import {OrderConfirmationComponent} from "../../../../components/order-confirmation/order-confirmation.component";
import {PaymentSuccessComponent} from "../../../../components/payment/payment-success.component";


export const clientRoutes: Routes = [
  {
    path: '',
    component: ClientDashboardComponent,
    children: [
      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
      },

      {
        path: 'order-confirmation/:id',
        component: OrderConfirmationComponent,
        canActivate: [AuthGuard]
      },

      {
        path: 'payment-success',

        component: OrderConfirmationComponent,
        canActivate: [AuthGuard]
      },

      {
        path: 'payment-success',
        component: PaymentSuccessComponent
      },

      {
        path: 'products',
        component: ClientProductsComponent,
        data: { title: 'Nos Produits' }
      },
      {
        path: 'products/:id',
        component: ProductDetailComponent,
        data: { title: 'Détail du produit' }
      },
      {
        path: 'cart',
        component: CartComponent,
        data: { title: 'Mon Panier' }
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Validation de commande',
          requiresAuth: true
        }
      },
      {
        path: 'profile',
        component: ClientProfileComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Mon Profil',
          requiresAuth: true
        }
      },
      {
        path: 'appointments',
        component: ClientAppointmentsComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'orders/:id',
        component: ClientOrderDetailComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Détail de la commande',
          requiresAuth: true
        }
      },
      {
        path: 'orders',
        component: ClientOrdersComponent,
        canActivate: [AuthGuard],
        data: {
          title: 'Mes Commandes',
          requiresAuth: true
        }

      }
    ]
  }
];
