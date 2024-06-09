import { Component } from '@angular/core';
import {DashboardHomePageComponent} from '../page';
import {RouterOutlet} from '@angular/router';



@Component({
  selector: 'app-dashboard-router',
  standalone: true,
  imports: [
    DashboardHomePageComponent,
    RouterOutlet,


  ],
  templateUrl: './dashboard-router.component.html',
  styleUrl: './dashboard-router.component.scss',
})
export class DashboardRouterComponent {

}
