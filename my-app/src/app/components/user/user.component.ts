import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { CreateUserDto } from 'app/models';
import { UserService } from 'app/services';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',

  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {
  successMessage: string = '';
  successDeleteMessage: string = '';
  errorMessage: string = '';
  users: any[] = [];
  newUser: CreateUserDto = new CreateUserDto();
  userIdToDelete: number = 0;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsers().subscribe({
      next: (response: any) => {
        if (response.result && response.data) {
          this.users = response.data;
          console.log('Users retrieved:', this.users);
        } else {
          console.error('Invalid response format:', response);
        }
      },
      error: (error: any) => {
        console.error('Error fetching users:', error);
      }
    });
  }
  createUser() {
    if (this.newUser.subscriptionId !== undefined) {
      this.newUser.subscriptionId = parseInt(this.newUser.subscriptionId as any, 10);
      if (isNaN(this.newUser.subscriptionId)) {
        console.error('subscriptionId must be a valid number');
        return;
      }
    }

    this.userService.createUser(this.newUser).subscribe({
      next: (response: any) => {
        this.successMessage = 'Utilisateur créé avec succès!';
        console.log('User created:', response);
        this.getUsers(); // Rafraîchir la liste des utilisateurs
        setTimeout(() => {
          this.successMessage = '';
        }, 3000); // Réinitialise le message après 3 secondes
      },
      error: (error: any) => {
        console.error('User creation failed:', error);
      }
    });
  }




  deleteUser() {
    this.userService.deleteUser(this.userIdToDelete).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== this.userIdToDelete);
        this.successDeleteMessage = `L'utilisateur avec l'ID ${this.userIdToDelete} a été supprimé avec succès.`;
        console.log('User deleted:', this.userIdToDelete);
        setTimeout(() => {
          this.successDeleteMessage = '';
        }, 3000);
      },
      error: (error: any) => {
        console.error('Error deleting user:', error);
      }
    });
  }
}
