import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: 'admin-dashboard.component.html',
  styleUrl:  'admin-dashboard.component.scss'
})
export class AdminDashboardComponent {
  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}
