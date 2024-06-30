import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTransactionDto } from 'app/models/create-transaction.dto';
=======
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
<<<<<<< HEAD
  private apiUrl = 'http://localhost:2024/api/transactions';

  constructor(private http: HttpClient) {}

  createTransaction(transactionData: CreateTransactionDto): Observable<any> {
    return this.http.post(this.apiUrl, transactionData);
  }

  getTransactions(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
=======

  constructor() { }
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673
}
