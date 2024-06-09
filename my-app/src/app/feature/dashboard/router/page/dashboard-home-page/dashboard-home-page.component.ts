import { Component } from '@angular/core';
import {RouterOutlet} from '@angular/router';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-dashboard-home-page',
  standalone: true,
  imports: [
    RouterOutlet, CommonModule
  ],
  templateUrl: './dashboard-home-page.component.html',
  styleUrl: './dashboard-home-page.component.scss'
})
export class DashboardHomePageComponent {

}
