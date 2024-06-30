import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgForOf, NgIf } from '@angular/common';
import { CreateTransactionDto } from 'app/models';
import { TransactionService } from 'app/services';

@Component({
  selector: 'app-transaction',
  templateUrl: './transaction.component.html',
  standalone: true,
  imports: [
    FormsModule,
    NgIf,
    NgForOf
  ],
  styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {
  successMessage: string = '';
  successDeleteMessage: string = '';
  errorMessage: string = '';
  transactions: any[] = [];
  newTransaction: CreateTransactionDto = new CreateTransactionDto();
  transactionIdToDelete: number = 0;

  constructor(private transactionService: TransactionService) {}

  ngOnInit() {
    this.getTransactions();
  }

  getTransactions() {
    this.transactionService.getTransactions().subscribe({
      next: (response: any) => {
        if (response.result && response.data) {
          this.transactions = response.data;
          console.log('Transactions retrieved:', this.transactions);
        } else {
          console.error('Invalid response format:', response);
        }
      },
      error: (error: any) => {
        console.error('Error fetching transactions:', error);
      }
    });
  }

  createTransaction() {

    this.newTransaction.date_transaction = new Date(this.newTransaction.date_transaction).toISOString().split('T')[0];


    const timeParts = this.newTransaction.hour_transaction.split(':');
    this.newTransaction.hour_transaction = `${timeParts[0]}:${timeParts[1]}:00`;

    this.transactionService.createTransaction(this.newTransaction).subscribe({
      next: (response: any) => {
        this.successMessage = 'Transaction créée avec succès!';
        console.log('Transaction created:', response);
        this.getTransactions();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error: any) => {
        console.error('Transaction creation failed:', error);
      }
    });
  }

  deleteTransaction() {
    this.transactionService.deleteTransaction(this.transactionIdToDelete).subscribe({
      next: () => {
        this.transactions = this.transactions.filter(transaction => transaction.id_transaction !== this.transactionIdToDelete);
        this.successDeleteMessage = `La transaction avec l'ID ${this.transactionIdToDelete} a été supprimée avec succès.`;
        console.log('Transaction deleted:', this.transactionIdToDelete);
        setTimeout(() => {
          this.successDeleteMessage = '';
        }, 3000);
      },
      error: (error: any) => {
        console.error('Error deleting transaction:', error);
      }
    });
  }
}

