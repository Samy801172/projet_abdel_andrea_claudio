import { Component, OnInit } from '@angular/core';
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { PrescriptionService } from '../../../../../services/prescription/prescription.service'; // Import du service

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
  prescriptions: any[] = []; // Liste des ordonnances
  clientId: string | null = localStorage.getItem('clientId'); // ID du client connecté

  constructor(private prescriptionService: PrescriptionService) {} // Injection du service

  //Charge les préscriptions du client au démarrage de la page
  ngOnInit() {
    this.loadPrescriptions(); // Charge les ordonnances au démarrage
  }

  //Récupère la liste des ordonnances via le service
  loadPrescriptions() {
    this.prescriptionService.getPrescriptions().subscribe({
      next: (data: any) => {
        this.prescriptions = data;
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des ordonnances :', err);
      },
    });
  }

   //Retourne un libellé lisible pour le statut d'une ordonnance
   //@param status - Statut de l'ordonnance en anglais
   //@returns - Traduction en français
   //
  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      PENDING: 'En attente',
      VERIFIED: 'Vérifié',
      REJECTED: 'Rejeté',
      EXPIRED: 'Expiré',
    };
    return statusMap[status] || 'Inconnu';
  }


   //Met à jour le statut d'une ordonnance via le service
   //@param id - ID de l'ordonnance
   //@param status - Nouveau statut
  updateStatus(id: number, status: string) {
    const clientId = this.clientId; // Récupération de l'ID du client connecté

    this.prescriptionService.updateStatus(id, status, clientId).subscribe({
      next: () => {
        this.loadPrescriptions(); // Recharge la liste après mise à jour
        alert(`Prescription ${status === 'VERIFIED' ? 'validée' : 'rejetée'} avec succès !`);
      },
      error: (err: any) => {
        console.error('Erreur lors de la mise à jour du statut :', err);
      },
    });
  }
}
