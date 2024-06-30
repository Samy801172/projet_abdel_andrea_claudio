import { Component, OnInit } from "@angular/core";
import { CreateTransactionDto } from "app/models/create-transaction.dto";
import { TransactionService } from "app/services/transaction.service";
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    NgIf
  ],
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  successMessage: string = '';
  errorMessage: string = ''; // Ajout de la propriété errorMessage
  successDeleteMessage: string = '';
  transactions: any[] = [];

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.getTransactions();
  }

  getTransactions() {
    this.transactionService.getTransactions().subscribe({
      next: (response) => {
        if (response.data && Array.isArray(response.data)) {
          this.transactions = response.data;
        } else {
          console.error('Response does not contain a valid data array:', response);
        }
      },
      error: (error) => {
        console.error('Error fetching transactions:', error);
      }
    });
  }

  submitTransaction(transactionData: CreateTransactionDto) {
    // Convertir l'heure en chaîne de date complète si nécessaire
    const hour = transactionData.hour_transaction;
    transactionData.hour_transaction = `1970-01-01T${hour}:00Z`; // Exemple de conversion

    this.transactionService.createTransaction(transactionData).subscribe({
      next: (response) => {
        this.successMessage = 'Transaction créée avec succès !';
        this.getTransactions();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
        this.errorMessage = ''; // Réinitialiser le message d'erreur en cas de succès
      },
      error: (error) => {
        console.error('Transaction creation failed:', error);
        this.successMessage = ''; // Réinitialiser le message de succès en cas d'erreur
        this.errorMessage = 'Échec de la création de la transaction.'; // Afficher un message d'erreur
        setTimeout(() => {
          this.errorMessage = '';
        }, 3000);
      }
    });
  }

  deleteTransaction(id: number) {
    this.transactionService.deleteTransaction(id).subscribe({
      next: () => {
        this.transactions = this.transactions.filter(transaction => transaction.id_transaction !== id);
        this.successDeleteMessage = `Transaction avec l'ID ${id} supprimée avec succès.`;
        setTimeout(() => {
          this.successDeleteMessage = '';
        }, 3000);
      },
      error: (error) => {
        console.error('Error deleting transaction:', error);
      }
    });
  }
}
