import {Component, Input} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import {DashboardRouterComponent} from '../feature/dashboard/router';
import {InputComponent} from "../shared";
import {DashboardHomePageComponent} from "../feature/dashboard/router/page";
import { SecurityFormComponent } from 'app/feature/security/component/security-form/security-form.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, DashboardRouterComponent, InputComponent, DashboardHomePageComponent,SecurityFormComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {


}
