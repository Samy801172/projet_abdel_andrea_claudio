import { Routes } from '@angular/router';
import { UserComponent } from '../components/user/user.component';
import { WalletComponent } from '../components/wallet/wallet.component';
import { HomeComponent } from '../components/home/home.component';
import { CryptocurrencyComponent } from '../components/cryptocurrency/cryptocurrency.component';
import { TransactionComponent } from '../components/transaction/transaction.component';
import { ForumComponent } from '../components/forum/forum.component';
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
