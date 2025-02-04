import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../../services/notification/notification.service';
import {FormsModule} from "@angular/forms";
import {DatePipe, NgForOf, NgIf} from "@angular/common"; // Remplace par ton service de notifications

@Component({
  selector: 'app-upload-prescription',
  templateUrl: 'ordonnance.component.html',
  styleUrls: ['ordonnance.component.scss'],
  imports: [
    FormsModule,
    DatePipe,
    NgIf,
    NgForOf
  ],
  standalone: true
})
export class UploadPrescriptionComponent implements OnInit {
  selectedFile: File | null = null;
  uploadedPrescriptions: any[] = [];
  showForm: boolean = false; // Formulaire masqué par défaut
  prescriptionDetails = {
    clientId: localStorage.getItem('clientId'),
    prescribed_by: '',
    medication_details: '',
    expiry_date: null,
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadPrescriptions();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
    }
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }



  onUpload() {
    if (!this.selectedFile) {
      alert('Veuillez sélectionner un fichier.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // Ajoute le client_id récupéré
    const clientId = localStorage.getItem('clientId');
    if (clientId) {
      formData.append('client_id', clientId);
    }

    formData.append('prescribed_by', this.prescriptionDetails.prescribed_by);
    formData.append('medication_details', this.prescriptionDetails.medication_details);

    if (this.prescriptionDetails.expiry_date) {
      const expiryDate = new Date(this.prescriptionDetails.expiry_date);
      formData.append('expiry_date', expiryDate.toISOString().split('T')[0]);
    }

    this.http.post('http://localhost:2024/api/prescriptions/upload', formData).subscribe({
      next: () => {
        this.loadPrescriptions(); // Recharge les ordonnances après l'upload
        alert('Ordonnance uploadée avec succès.');
      },
      error: (err) => {
        console.error('Erreur lors de l\'upload :', err);
        alert('Erreur lors de l\'upload de l\'ordonnance.');
      },
    });
  }


  loadPrescriptions() {
    const clientId = localStorage.getItem('clientId'); // Récupère l'ID du client
    if (!clientId) {
      console.error('Client ID non défini');
      return;
    }

    // Fait une requête GET avec le client_id comme paramètre
    this.http.get(`http://localhost:2024/api/prescriptions/${clientId}`).subscribe({
      next: (data: any) => {
        this.uploadedPrescriptions = data; // Stocke les ordonnances récupérées
        console.log('Prescriptions chargées :', this.uploadedPrescriptions);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des ordonnances :', err);
      },
    });
  }
}
