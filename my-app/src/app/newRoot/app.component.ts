<<<<<<< HEAD
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from '../components/home/home.component';
import { SubscriptionComponent } from '../components/subscription/subscription.component';
import { WalletComponent } from '../components/wallet/wallet.component';
import { UserComponent } from '../components/user/user.component';
import { CryptocurrencyComponent } from '../components/cryptocurrency/cryptocurrency.component';
import { TransactionComponent } from '../components/transaction/transaction.component';
import { ForumComponent } from '../components/forum/forum.component';
=======
// app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routes } from './app.routes';
import {UserComponent} from '../components/user/user.component';
import {WalletComponent} from '../components/wallet/wallet.component';
import {HomeComponent} from '../components/home/home.component';
import {FormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';

>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
<<<<<<< HEAD
    FormsModule,
    HttpClientModule,
    HomeComponent,
    SubscriptionComponent,
    WalletComponent,
    UserComponent,
    CryptocurrencyComponent,
    TransactionComponent,
    ForumComponent
=======
    UserComponent,
    WalletComponent,
    HomeComponent,
    FormsModule,
    HttpClientModule
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
<<<<<<< HEAD
=======

>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673
