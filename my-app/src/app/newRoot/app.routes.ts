
import { Routes } from '@angular/router';
<<<<<<< HEAD
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
=======
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
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673
  { path: 'cryptocurrency', component: CryptocurrencyComponent },
  { path: 'transaction', component: TransactionComponent },
  { path: 'subscription', component: SubscriptionComponent },
  { path: 'forum', component: ForumComponent },
<<<<<<< HEAD
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', redirectTo: '/home', pathMatch: 'full' }
=======
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Redirection par défaut
  { path: '**', redirectTo: '/home', pathMatch: 'full' } // Redirection pour les routes non trouvées
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673
];
