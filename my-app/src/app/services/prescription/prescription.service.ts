import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PrescriptionService {
  private apiUrl = 'http://localhost:2024/api/prescriptions'; // URL de l'API

  constructor(private http: HttpClient) {}


   //Récupère toutes les ordonnances depuis l'API
   //@returns Observable contenant la liste des ordonnances
  getPrescriptions() {
    return this.http.get(this.apiUrl);
  }

   //Met à jour le statut d'une ordonnance
   //@param id - ID de l'ordonnance à mettre à jour
   //@param status - Nouveau statut de l'ordonnance
   //@param verifiedBy - ID de l'admin qui valide/rejette l'ordonnance
   //@returns Observable de la requête HTTP
  updateStatus(id: number, status: string, verifiedBy: string | null) {
    return this.http.put(`${this.apiUrl}/${id}/update-status`, {
      status,
      verified_by: verifiedBy,
    });
  }

   //Envoie un fichier d'ordonnance à l'API
   //@param orderId - ID de la commande associée
   //@param file - Fichier de l'ordonnance
   //@returns Observable du résultat de l'upload
  uploadPrescription(orderId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('orderId', orderId.toString());

    return this.http.post(`${this.apiUrl}/upload`, formData);
  }
}
