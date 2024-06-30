import { Injectable } from '@angular/core';
<<<<<<< HEAD
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCryptocurrencyDto } from 'app/models/create-createCryptocurrency.dto';
=======
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673

@Injectable({
  providedIn: 'root'
})
export class CryptocurrencyService {
<<<<<<< HEAD
  private apiUrl = 'http://localhost:2024/api/cryptocurrency';

  constructor(private http: HttpClient) {}

  createCryptocurrency(cryptocurrencyData: CreateCryptocurrencyDto): Observable<any> {
    return this.http.post(this.apiUrl, cryptocurrencyData);
  }

  getCryptocurrencies(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  deleteCryptocurrency(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
=======

  constructor() { }
>>>>>>> 475c5921b4662d1c07777e2a99e1bb21ef9f7673
}
