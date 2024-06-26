
import { Routes } from '@angular/router';
import { AppNode } from '@shared-router';
import {UserComponent} from '../../components/user/user.component';
import {WalletComponent} from '../../components/wallet/wallet.component';


export const dashboardRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./router').then(m => m.DashboardRouterComponent),
    children: [
      {
        path: '',
        redirectTo: AppNode.HOME,
        pathMatch: 'full'
      },
      {
        path: AppNode.HOME,
        loadComponent: () => import('./router/page').then(m => m.DashboardHomePageComponent)
      },
      {
        path: AppNode.MEMBER,
        loadChildren: () => import('../member/member.routes').then(m => m.memberRoutes)
      },
      {
        path: 'user', // Ajout de la route User
        component: UserComponent
      },
      {
        path: 'wallet', // Ajout de la route Wallet
        component: WalletComponent
      },
      // Ajoutez d'autres routes si nécessaire
    ]
  }
];
