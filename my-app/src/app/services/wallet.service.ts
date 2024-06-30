import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateWalletDto } from 'app/models';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private apiUrl = 'http://localhost:2024/api/wallet';

  constructor(private http: HttpClient) {}

  createWallet(walletData: CreateWalletDto): Observable<any> {
    return this.http.post(`${this.apiUrl}/create`, walletData);
  }

  getWallets(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  deleteWallet(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
