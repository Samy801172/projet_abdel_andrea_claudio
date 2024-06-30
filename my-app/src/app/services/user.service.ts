import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { CreateUserDto } from "app/models";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private apiUrl = 'http://localhost:2024/api/users/create';

  constructor(private http: HttpClient) { }

  createUser(user: CreateUserDto): Observable<any> {
    return this.http.post<any>(this.apiUrl, user);
  }

  getUsers(): Observable<any> {
    return this.http.get<any>('http://localhost:2024/api/users');
  }

  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`http://localhost:2024/api/users/${id}`);
  }
}
