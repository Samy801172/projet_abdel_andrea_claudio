import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
=======
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
<<<<<<< HEAD
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
=======

  constructor() { }
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673
}
