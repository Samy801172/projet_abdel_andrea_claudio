import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../../../../services/notification/notification.service';
import { FormsModule } from "@angular/forms";
import { DatePipe, NgClass, NgForOf, NgIf } from "@angular/common"; // Importation de modules pour l'affichage et les formulaires

@Component({
  selector: 'app-upload-prescription', // Sélecteur du composant
  templateUrl: 'ordonnance.component.html', // Lien vers le template HTML
  styleUrls: ['ordonnance.component.scss'], // Lien vers la feuille de style
  imports: [
    FormsModule, // Gestion des formulaires
    DatePipe, // Formatage des dates
    NgIf, NgForOf, NgClass // Directives Angular pour l'affichage conditionnel et les listes
  ],
  standalone: true // Indique que ce composant est autonome et peut être utilisé sans module
})
export class UploadPrescriptionComponent implements OnInit {
  selectedFile: File | null = null; // Fichier sélectionné pour l'upload
  uploadedPrescriptions: any[] = []; // Liste des ordonnances déjà uploadées
  showForm: boolean = false; // Détermine si le formulaire est visible ou non

  // Détails de l'ordonnance en cours d'upload
  prescriptionDetails = {
    clientId: localStorage.getItem('clientId'), // Récupération de l'ID du client
    prescribed_by: '', // Nom du médecin
    medication_details: '', // Détails du médicament
    expiry_date: this.getFutureDate(7), // Définit la date d'expiration par défaut à aujourd'hui +7 jours
  };

  constructor(private http: HttpClient, private notificationService : NotificationService) {} // Injection du service HttpClient pour faire des requêtes API

  ngOnInit() {
    this.loadPrescriptions(); // Charge les ordonnances au chargement du composant
  }

  // Cette méthode permet d'ajouter 7 jours à la date de validation (en gros elle sera valide 7 jours)
  getFutureDate(days: number): string {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return futureDate.toISOString().split('T')[0]; // Retourne la date au format YYYY-MM-DD
  }


  //Capture le fichier sélectionné par l'utilisateur.
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0]; // Stocke le fichier sélectionné
    }
  }

  //Convertit le statut de l'ordonnance en un libellé lisible.
  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      PENDING: 'En attente',
      VERIFIED: 'Vérifié',
      REJECTED: 'Rejeté',
      EXPIRED: 'Expiré',
    };
    return statusMap[status] || 'Inconnu'; // Retourne 'Inconnu' si le statut ne correspond à rien
  }

  //Affiche ou masque le formulaire d'upload.
  toggleForm() {
    this.showForm = !this.showForm;
  }

  //Upload une nouvelle ordonnance.
  onUpload() {
    if (!this.selectedFile) {
      alert('Veuillez sélectionner un fichier.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile); // Ajoute le fichier sélectionné

    // Récupération de l'ID du client stocké en local
    const clientId = localStorage.getItem('clientId');
    if (clientId) {
      formData.append('client_id', clientId);
    }

    // Ajout des autres informations du formulaire
    formData.append('prescribed_by', this.prescriptionDetails.prescribed_by);
    formData.append('medication_details', this.prescriptionDetails.medication_details);

    // Formatage de la date d'expiration en ISO avant de l'envoyer
    if (this.prescriptionDetails.expiry_date) {
      const expiryDate = new Date(this.prescriptionDetails.expiry_date);
      formData.append('expiry_date', expiryDate.toISOString().split('T')[0]);
    }

    // Envoi de la requête HTTP POST pour uploader l'ordonnance
    this.http.post('http://localhost:2024/api/prescriptions/upload', formData).subscribe({
      next: () => {
        this.loadPrescriptions(); // Recharge les ordonnances après l'upload
        this.toggleForm();
        this.notificationService.success("Fichier chargé avec succès, attendez l'approbation d'un pharmacien.")
      },
      error: (err) => {
        console.error('Erreur lors de l\'upload :', err);
        this.notificationService.error("Une erreur s'est produite lors du chargement de votre fichier !")
      },
    });
  }

  //Charge les ordonnances de l'utilisateur connecté.
  loadPrescriptions() {
    const clientId = localStorage.getItem('clientId'); // Récupère l'ID du client
    if (!clientId) {
      console.error('Client ID non défini');
      return;
    }

    // Requête HTTP GET pour récupérer les ordonnances du client
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
