import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HomeComponent } from '../components';
import { SubscriptionComponent } from '../components';
import { WalletComponent } from '../components';
import { UserComponent } from '../components';
import { CryptocurrencyComponent } from '../components';
import { TransactionComponent } from '../components';
import { ForumComponent } from '../components';

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
