import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateTransactionDto } from 'app/models/create-transaction.dto';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
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
}
