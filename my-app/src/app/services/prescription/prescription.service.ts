import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class PrescriptionService {
  private apiUrl = 'http://localhost:2024/api/prescriptions';

  constructor(private http: HttpClient) {}

  uploadPrescription(orderId: number, file: File) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('orderId', orderId.toString());

    return this.http.post(`${this.apiUrl}/upload`, formData);
  }
}
