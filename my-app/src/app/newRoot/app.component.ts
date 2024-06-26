// app.component.ts
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { routes } from './app.routes';
import {UserComponent} from '../components/user/user.component';
import {WalletComponent} from '../components/wallet/wallet.component';
import {HomeComponent} from '../components/home/home.component'; // Importez vos routes ici



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    UserComponent,
    WalletComponent,
    HomeComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}

