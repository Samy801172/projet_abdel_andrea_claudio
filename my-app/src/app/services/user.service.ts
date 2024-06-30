<<<<<<< HEAD
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDto } from 'app/models/create-user.dto';

=======

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673

@Injectable({
  providedIn: 'root'
})
export class UserService {
<<<<<<< HEAD

  private apiUrl = 'http://localhost:2024/api/users';

  constructor(private http: HttpClient) { }


  createUser(user: CreateUserDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, user);
  }


  getUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }


  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
=======
  private baseUrl = 'http://localhost:2024/api';

  constructor(private http: HttpClient) {}

  createUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, user);
  }


}

>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673
