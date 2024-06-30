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

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpClientModule,
    HomeComponent,
    SubscriptionComponent,
    WalletComponent,
    UserComponent,
    CryptocurrencyComponent,
    TransactionComponent,
    ForumComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}
