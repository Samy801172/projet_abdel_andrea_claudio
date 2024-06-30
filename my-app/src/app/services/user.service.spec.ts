import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {CreateUserDto} from '../models/create-user.dto';


@Injectable({
  providedIn: 'root'
})
export class UserService {
<<<<<<< HEAD
  getUsers() {
      throw new Error('Method not implemented.');
  }
  deleteUser(userIdToDelete: number) {
      throw new Error('Method not implemented.');
  }
=======
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673
  private apiUrl = 'http://localhost:2024/api/users';

  constructor(private http: HttpClient) {}

  createUser(user: CreateUserDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create`, user);
  }
}
