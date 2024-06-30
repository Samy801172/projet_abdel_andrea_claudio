import { Component, OnInit } from '@angular/core';
import { WalletService } from 'app/services/wallet.service';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { CreateWalletDto } from 'app/models';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  successMessage: string = '';
  successDeleteMessage: string = '';
  wallets: any[] = [];

  constructor(private walletService: WalletService) {}

  ngOnInit() {
    this.getWallets();
  }

  getWallets() {
    this.walletService.getWallets().subscribe({
      next: (response) => {
        console.log('Response:', response); // Log the response
        if (response.data && Array.isArray(response.data)) {
          this.wallets = response.data;
          console.log('Wallets retrieved:', this.wallets);
        } else {
          console.error('Response does not contain a valid data array:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching wallets:', error);
      }
    });
  }



  submitWallet(walletData: CreateWalletDto) {
    this.walletService.createWallet(walletData).subscribe({
      next: (response) => {
        this.successMessage = 'Portefeuille créé avec succès !';
        console.log('Wallet creation success:', response);
        this.getWallets();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Wallet creation failed:', error);
      }
    });
  }

  deleteWallet(id: number) {
    this.walletService.deleteWallet(id).subscribe({
      next: () => {
        this.wallets = this.wallets.filter(wallet => wallet.id_wallet !== id);
        this.successDeleteMessage = `Portefeuille avec l'ID ${id} supprimé avec succès.`;
        console.log('Wallet deleted:', id);
        setTimeout(() => {
          this.successDeleteMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error deleting wallet:', error);
      }
    });
  }
}
