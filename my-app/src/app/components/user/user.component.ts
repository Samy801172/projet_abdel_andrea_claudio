import { Component } from '@angular/core';
import {CreateUserDto} from '../../models/create-user.dto';
import {UserService} from '../../services/user.service';
import {FormsModule, NgForm} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
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
  }
}
