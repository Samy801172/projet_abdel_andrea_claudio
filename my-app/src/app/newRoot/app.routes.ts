
import { Routes } from '@angular/router';
import {UserComponent} from '../components/user/user.component';
import {WalletComponent} from '../components/wallet/wallet.component';
import {HomeComponent} from '../components/home/home.component';
import {CryptocurrencyComponent} from '../components/cryptocurrency/cryptocurrency.component';
import {TransactionComponent} from '../components/transaction/transaction.component';
import {SubscriptionComponent} from '../components/subscription/subscription.component';
import {ForumComponent} from '../components/forum/forum.component';

export const routes: Routes = [
  { path: 'user', component: UserComponent },
  { path: 'wallet', component: WalletComponent },
  { path: 'home', component: HomeComponent },
  { path: 'cryptocurrency', component: CryptocurrencyComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: 'subscription', component: SubscriptionComponent },
  { path: 'forum', component: ForumComponent },
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirection par défaut
  { path: '**', redirectTo: '/home', pathMatch: 'full' } // Redirection pour les routes non trouvées
];
