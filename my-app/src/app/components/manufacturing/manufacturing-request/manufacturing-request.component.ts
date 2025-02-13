import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ManufacturingService } from '../../../services/manufacturing/manufacturing.service';
import { NotificationService } from '../../../services/notification/notification.service';
import { 
  ManufacturingRequest,
  ManufacturingResponse
} from '../../../models/manufacturing/manufacturing-request.model';

@Component({
  selector: 'app-manufacturing-request',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="request-container">
      <h2>Demande de Fabrication sur Mesure</h2>

      <form [formGroup]="requestForm" (ngSubmit)="onSubmit()">
        <!-- Type de médicament -->
        <div class="form-group">
          <label for="medicationType">Type de médicament*</label>
          <select id="medicationType" formControlName="type">
            <option value="">Sélectionnez un type</option>
            <option value="cream">Crème</option>
            <option value="capsules">Gélules</option>
          </select>
          @if (requestForm.get('type')?.errors?.['required'] && requestForm.get('type')?.touched) {
            <small class="error">Ce champ est requis</small>
          }
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="description">Description*</label>
          <textarea 
            id="description" 
            formControlName="description"
            placeholder="Décrivez votre besoin...">
          </textarea>
          @if (requestForm.get('description')?.errors?.['required'] && requestForm.get('description')?.touched) {
            <small class="error">Ce champ est requis</small>
          }
        </div>

        <!-- Instructions (optionnel) -->
        <div class="form-group">
          <label for="instructions">Instructions supplémentaires</label>
          <textarea 
            id="instructions" 
            formControlName="instructions"
            placeholder="Instructions spécifiques (optionnel)...">
          </textarea>
        </div>

        <!-- Ordonnance -->
        <div class="form-group">
          <label for="prescription">Ordonnance* (PDF ou Image)</label>
          <input 
            type="file" 
            id="prescription"
            (change)="onFileSelected($event)"
            accept=".pdf,.jpg,.jpeg,.png">
          @if (!selectedFile) {
            <small class="error">Une ordonnance est requise</small>
          }
        </div>

        <div class="form-actions">
          <button type="submit" [disabled]="!requestForm.valid || !selectedFile">
            Soumettre la demande
          </button>
        </div>
      </form>

      @if (loading) {
        <div class="loading">Traitement en cours...</div>
      }
    </div>
  `,
  styles: [`
    .request-container {
      max-width: 500px;
      margin: 20px auto;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 20px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: 500;
    }

    select, textarea {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    textarea {
      height: 100px;
    }

    .error {
      color: red;
      font-size: 12px;
      margin-top: 5px;
      display: block;
    }

    button {
      background: #0066cc;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:disabled {
        background: #cccccc;
      }
    }

    .loading {
      text-align: center;
      margin-top: 20px;
      color: #666;
    }
  `]
})
export class ManufacturingRequestComponent implements OnInit {
  requestForm: FormGroup;
  selectedFile: File | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private manufacturingService: ManufacturingService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.requestForm = this.fb.group({
      type: ['', Validators.required],
      description: ['', Validators.required],
      instructions: [''],
      prescription: [null, Validators.required]
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.requestForm.patchValue({
        prescription: file
      });
    }
  }

  validateForm(): boolean {
    if (!this.requestForm.valid) {
      this.notificationService.error('Veuillez remplir tous les champs requis');
      return false;
    }

    if (!this.selectedFile) {
      this.notificationService.error('Une ordonnance est requise');
      return false;
    }

    const fileType = this.selectedFile.type;
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(fileType)) {
      this.notificationService.error('Format de fichier non supporté');
      return false;
    }

    return true;
  }

  onSubmit(): void {
    if (this.requestForm.valid && this.selectedFile) {
      this.loading = true;
      const formData = new FormData();
      
      formData.append('type', this.requestForm.get('type')?.value);
      formData.append('description', this.requestForm.get('description')?.value);
      formData.append('instructions', this.requestForm.get('instructions')?.value || '');
      formData.append('prescription', this.selectedFile);

      console.log('Envoi de la demande...', {
        type: this.requestForm.get('type')?.value,
        description: this.requestForm.get('description')?.value,
        instructions: this.requestForm.get('instructions')?.value,
        prescriptionFile: this.selectedFile.name
      });

      this.manufacturingService.createManufacturingRequest(formData)
        .subscribe({
          next: (response: ManufacturingResponse) => {
            console.log('Réponse reçue:', response);
            this.notificationService.success('Demande envoyée avec succès');
            this.router.navigate(['/manufacturing/payment', response.id]);
          },
          error: (error) => {
            console.error('Erreur lors de l\'envoi:', error);
            this.notificationService.error('Erreur lors de l\'envoi de la demande');
            this.loading = false;
          }
        });
    }
  }
} 