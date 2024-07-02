import { Routes } from '@angular/router';
import { UserComponent } from '../components';
import { WalletComponent } from '../components';
import { HomeComponent } from '../components';
import { CryptocurrencyComponent } from '../components';
import { TransactionComponent } from '../components';
import { ForumComponent } from '../components';
import { SubscriptionComponent } from 'app/components/subscription/subscription.component';

export const DEFAULT_ROUTE = '/home';

export const routes: Routes = [
  { path: 'home', component: HomeComponent },
  { path: 'user', component: UserComponent },
  { path: 'wallet', component: WalletComponent },
  { path: 'cryptocurrency', component: CryptocurrencyComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: 'subscription', component: SubscriptionComponent },
  { path: 'forum', component: ForumComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
];
