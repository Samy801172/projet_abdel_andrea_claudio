<<<<<<< HEAD
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { CreateUserDto } from 'app/models';
import { UserService } from 'app/services';
=======
import { Component } from '@angular/core';
import {CreateUserDto} from '../../models/create-user.dto';
import {UserService} from '../../services/user.service';
import {FormsModule, NgForm} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
<<<<<<< HEAD

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
        }, 3000); // Réinitialise le message après 3 secondes
      },
      error: (error: any) => {
        console.error('Error deleting user:', error);
      }
    });
=======
  standalone: true,
  imports: [
    FormsModule, CommonModule, HttpClientModule
  ],
  styleUrls: ['./user.component.scss']
})
export class UserComponent {
  transactions: string[] = [
    'Bought 0.5 BTC',
    'Sold 1 ETH',
    'Transferred 100 USDT'
  ];

  user: CreateUserDto = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    statut_verif_identite_user: '',
    type_user: '',
    password: '',
    subscription: { id: 1 }
  };

  constructor(private userService: UserService) {}

  createUser(userForm: NgForm) {
    if (userForm.valid) {
      this.userService.createUser(this.user).subscribe({
        next: (response) => {
          console.log('User created successfully:', response);

          userForm.resetForm();
        },
        error: (error) => {
          console.error('Error creating user:', error);

        }
      });
    }
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673
  }
}
