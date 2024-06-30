import { Component, OnInit } from '@angular/core';
import { CreateCryptocurrencyDto } from 'app/models/create-createCryptocurrency.dto';
import { CryptocurrencyService } from 'app/services/cryptocurrency.service';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';


@Component({
  selector: 'app-cryptocurrency',
  templateUrl: './cryptocurrency.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./cryptocurrency.component.scss']
})
export class CryptocurrencyComponent implements OnInit {
  successMessage: string = '';
  successDeleteMessage: string = '';
  cryptocurrencies: any[] = [];

  constructor(private cryptocurrencyService: CryptocurrencyService) {}

  ngOnInit() {
    //this.getCryptocurrencies();
  }

  getCryptocurrencies() {
    this.cryptocurrencyService.getCryptocurrencies().subscribe({
      next: (response) => {
        if (response.data && Array.isArray(response.data)) {
          this.cryptocurrencies = response.data;
        } else {
          console.error('Response does not contain a valid data array:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching cryptocurrencies:', error);
      }
    });
  }

  submitCryptocurrency(cryptocurrencyData: CreateCryptocurrencyDto) {
    this.cryptocurrencyService.createCryptocurrency(cryptocurrencyData).subscribe({
      next: (response) => {
        this.successMessage = 'Cryptomonnaie créée avec succès !';
        this.getCryptocurrencies();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Cryptocurrency creation failed:', error);
      }
    });
  }

  deleteCryptocurrency(id: number) {
    this.cryptocurrencyService.deleteCryptocurrency(id).subscribe({
      next: () => {
        this.cryptocurrencies = this.cryptocurrencies.filter(crypto => crypto.id_crypto !== id);
        this.successDeleteMessage = `Cryptomonnaie avec l'ID ${id} supprimée avec succès.`;
        setTimeout(() => {
          this.successDeleteMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error deleting cryptocurrency:', error);
      }
    });
  }
}

