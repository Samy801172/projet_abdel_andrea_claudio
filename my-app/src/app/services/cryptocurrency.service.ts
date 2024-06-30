import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateCryptocurrencyDto } from 'app/models/create-createCryptocurrency.dto';

@Injectable({
  providedIn: 'root'
})
export class CryptocurrencyService {
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
}
