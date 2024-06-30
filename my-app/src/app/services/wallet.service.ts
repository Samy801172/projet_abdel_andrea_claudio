import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateWalletDto } from 'app/models';
=======
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673

@Injectable({
  providedIn: 'root'
})
export class WalletService {
<<<<<<< HEAD
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
=======

  constructor() { }
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673
}
