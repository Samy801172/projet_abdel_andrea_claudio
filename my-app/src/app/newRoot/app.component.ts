import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../shared/navbar/navbar.component';
import { ServiceComponent } from '../components/service/service.component';
import { AppointmentComponent } from '../components/appointment/appointment.component';
import { ClientComponent } from '../components';
import { AdminComponent } from '../components/Admin/admin.component';
import { LoggingService } from '../services/Logging/Logging.service';
import { NotificationComponent } from '../components/Notifications/notification.component';
import { CardComponent } from '../shared';
import { HttpClientModule } from '@angular/common/http';
import { CartService, OrderService } from '../services';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  providers: [CartService, OrderService],
  imports: [FormsModule,
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    HttpClientModule,
    RouterModule,
    ServiceComponent,
    AppointmentComponent,
    ClientComponent,
    AdminComponent,
    NotificationComponent,
    CardComponent,

  ],
  template: `
    <div class="app-container">
      <app-navbar></app-navbar>
      <app-notification></app-notification>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-content {
      flex: 1;
      padding: 20px;
      background-color: #f5f6fa;
    }

    :host {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #333;
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  `]
})
export class AppComponent implements OnInit {
  constructor(
    private loggingService: LoggingService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loggingService.logNavigationEvents();
    console.log('Routes configurées:', this.router.config);
  }
}
