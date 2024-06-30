import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateForumDto } from 'app/models/create-forum.dto';


@Injectable({
  providedIn: 'root'
})
export class ForumService {
  private apiUrl = 'your-api-url'; // Replace with your API URL

  constructor(private http: HttpClient) {}

  getForums(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/forums`);
  }

  createForum(forumData: CreateForumDto): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/forums`, forumData);
  }

  deleteForum(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/forums/${id}`);
  }
}
