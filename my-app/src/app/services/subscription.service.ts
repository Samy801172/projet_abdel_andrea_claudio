import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private apiUrl = 'http://localhost:2024/api/subscription';

  constructor(private http: HttpClient) {}

  createSubscription(subscriptionData: any): Observable<any> {
    return this.http.post(this.apiUrl, subscriptionData);
  }

  getSubscriptions(): Observable<any> {
    return this.http.get(this.apiUrl);
  }
  deleteSubscription(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
