import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {NgClass, NgForOf, NgIf} from "@angular/common";

@Component({
  selector: 'app-admin-prescriptions',
  templateUrl: './admin-prescriptions.component.html',
  styleUrls: ['./admin-prescriptions.component.scss'],
  imports: [
    NgClass,
    NgForOf,
    NgIf
  ],
  standalone: true
})
export class AdminPrescriptionsComponent implements OnInit {
  prescriptions: any[] = [];
  clientId: string | null = localStorage.getItem('clientId');

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPrescriptions();
  }

  loadPrescriptions() {
    this.http.get('http://localhost:2024/api/prescriptions').subscribe({
      next: (data: any) => {
        this.prescriptions = data;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des ordonnances :', err);
      },
    });
  }

  // Les différents status de prescriptions
  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      PENDING: 'En attente',
      VERIFIED: 'Vérifié',
      REJECTED: 'Rejeté',
      EXPIRED: 'Expiré',
    };
    return statusMap[status] || 'Inconnu';
  }


  updateStatus(id: number, status: string) {
    const clientId = this.clientId; // TODO: Remplace par l'ID de l'admin connecté

    this.http.put(`http://localhost:2024/api/prescriptions/${id}/update-status`, {
      status: status,
      verified_by: clientId,
    }).subscribe({
      next: () => {
        this.loadPrescriptions(); // Recharge la liste après modification
        alert(`Prescription ${status === 'VERIFIED' ? 'validée' : 'rejetée'} avec succès !`);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du statut :', err);
      },
    });
  }
}
