import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateUserDto } from 'app/models/create-user.dto';


@Injectable({
  providedIn: 'root'
})
export class UserService {

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
