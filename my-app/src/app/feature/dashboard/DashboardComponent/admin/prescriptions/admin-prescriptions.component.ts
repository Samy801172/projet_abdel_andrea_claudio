import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgClass, NgForOf, NgIf } from "@angular/common";

@Component({
  selector: 'app-admin-prescriptions', // Sélecteur du composant
  templateUrl: './admin-prescriptions.component.html', // Fichier HTML associé
  styleUrls: ['./admin-prescriptions.component.scss'], // Fichier CSS associé
  imports: [
    NgClass, // Permet d'appliquer des classes dynamiques
    NgForOf, // Permet d'itérer sur une liste dans le HTML
    NgIf // Permet d'afficher ou masquer des éléments
  ],
  standalone: true // Indique que ce composant est indépendant
})
export class AdminPrescriptionsComponent implements OnInit {
  prescriptions: any[] = []; // Stocke la liste des ordonnances
  clientId: string | null = localStorage.getItem('clientId'); // Récupère l'ID du client connecté

  constructor(private http: HttpClient) {} // Injection du service HttpClient pour interagir avec l'API

  ngOnInit() {
    this.loadPrescriptions(); // Charge les ordonnances au démarrage
  }

  // Récupère les ordonnances depuis l'API
  loadPrescriptions() {
    this.http.get('http://localhost:2024/api/prescriptions').subscribe({
      next: (data: any) => {
        this.prescriptions = data; // Stocke les ordonnances récupérées
      },
      error: (err) => {
        console.error('Erreur lors du chargement des ordonnances :', err);
      },
    });
  }

  // Retourne un libellé lisible pour le statut d'une ordonnance
  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      PENDING: 'En attente',
      VERIFIED: 'Vérifié',
      REJECTED: 'Rejeté',
      EXPIRED: 'Expiré',
    };
    return statusMap[status] || 'Inconnu'; // Retourne 'Inconnu' si le statut n'existe pas
  }

  // Met à jour le statut d'une ordonnance
  updateStatus(id: number, status: string) {
    const clientId = this.clientId; // Récupère l'ID du client (utilisateur qui valide)

    this.http.put(`http://localhost:2024/api/prescriptions/${id}/update-status`, {
      status: status,
      verified_by: clientId, // Indique quel admin a validé/rejeté l'ordonnance
    }).subscribe({
      next: () => {
        this.loadPrescriptions(); // Recharge la liste des ordonnances après modification
        alert(`Prescription ${status === 'VERIFIED' ? 'validée' : 'rejetée'} avec succès !`);
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du statut :', err);
      },
    });
  }
}
