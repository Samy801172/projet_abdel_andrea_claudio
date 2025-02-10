import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ManufacturingService } from '../../../../services/manufacturing/manufacturing.service';
import { MedicationComponent, ManufacturingRequest } from '../../../../models/manufacturing.model';

@Component({
  selector: 'app-custom-manufacturing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="custom-manufacturing-container">
      <h2>Demande de fabrication sur mesure</h2>

      <form [formGroup]="manufacturingForm" (ngSubmit)="onSubmit()" class="manufacturing-form">
        <div class="form-group">
          <label>Ordonnance</label>
          <input
            type="file"
            (change)="onFileSelected($event)"
            accept=".pdf,.jpg,.jpeg,.png"
            required
          >
          <small>Format accepté: PDF, JPG, PNG</small>
        </div>

        <div class="form-group">
          <label>Notes supplémentaires</label>
          <textarea
            formControlName="notes"
            rows="4"
            placeholder="Ajoutez des notes supplémentaires si nécessaire"
          ></textarea>
        </div>

        <div class="composition-details" *ngIf="availableComponents.length">
          <h3>Composition prescrite</h3>
          <div class="composition-list">
            <div *ngFor="let item of availableComponents" class="composition-item">
              <span>{{ item.name }}</span>
              <span>{{ item.quantity }}{{ item.unit }} ({{ item.basePrice | number:'1.2-2' }}€)</span>
            </div>
          </div>
        </div>

        <div class="price-summary">
          <div class="price-line">
            <span>Prix des composants:</span>
            <span>{{ calculateComponentsTotal() | number:'1.2-2' }} €</span>
          </div>
          <div class="price-line">
            <span>Frais de fabrication:</span>
            <span>{{ manufacturingFee | number:'1.2-2' }} €</span>
          </div>
          <div class="price-line total">
            <span>Montant total:</span>
            <span>{{ calculateTotal() | number:'1.2-2' }} €</span>
          </div>
          <div class="price-line deposit">
            <span>Acompte requis (30%):</span>
            <span>{{ calculateDeposit() | number:'1.2-2' }} €</span>
          </div>
        </div>

        <button
          type="submit"
          [disabled]="!isFormValid()"
          class="submit-button"
        >
          {{ loading ? 'Traitement en cours...' : 'Soumettre la demande' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .custom-manufacturing-container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .manufacturing-form {
      .form-group {
        margin-bottom: 1.5rem;

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        input[type="file"] {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        small {
          color: #666;
          font-size: 0.85rem;
        }

        textarea {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
      }
    }

    .composition-details {
      margin: 2rem 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;

      .composition-item {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;

        &:last-child {
          border-bottom: none;
        }
      }
    }

    .price-summary {
      margin: 2rem 0;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 4px;

      .price-line {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;

        &.deposit {
          font-weight: bold;
          color: #0066cc;
          border-top: 1px solid #ddd;
          margin-top: 0.5rem;
          padding-top: 1rem;
        }
      }
    }

    .submit-button {
      width: 100%;
      padding: 1rem;
      background: #0066cc;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1.1rem;
      cursor: pointer;
      transition: background 0.3s;

      &:disabled {
        background: #ccc;
        cursor: not-allowed;
      }

      &:hover:not(:disabled) {
        background: #0052a3;
      }
    }
  `]
})
export class CustomManufacturingComponent implements OnInit {
  manufacturingForm: FormGroup;
  selectedFile: File | null = null;
  loading = false;
  manufacturingFee = 50;
  availableComponents: MedicationComponent[] = [];

  constructor(
    private fb: FormBuilder,
    private manufacturingService: ManufacturingService,
    private router: Router
  ) {
    this.manufacturingForm = this.fb.group({
      prescription: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit() {
    this.loadAvailableComponents();
  }

  private loadAvailableComponents() {
    this.manufacturingService.getAvailableComponents()
      .subscribe({
        next: (components) => {
          this.availableComponents = components;
          console.log('Composants chargés:', components);
        },
        error: (error) => {
          console.error('Erreur lors du chargement des composants:', error);
        }
      });
  }

  calculateComponentsTotal(): number {
    return this.availableComponents.reduce((total, item) =>
      total + item.basePrice, 0);
  }

  calculateTotal(): number {
    return this.calculateComponentsTotal() + this.manufacturingFee;
  }

  calculateDeposit(): number {
    return this.calculateTotal() * 0.3;
  }

  isFormValid(): boolean {
    return this.manufacturingForm.valid && this.selectedFile !== null;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.manufacturingForm.patchValue({ prescription: file.name });
      this.manufacturingForm.markAsDirty();
    }
  }

  async onSubmit(): Promise<void> {
    if (this.isFormValid()) {
      this.loading = true;
      try {
        const manufacturingRequest: ManufacturingRequest = {
          notes: this.manufacturingForm.get('notes')?.value,
          components: this.availableComponents,
          totalAmount: this.calculateTotal(),
          depositAmount: this.calculateDeposit(),
          prescription: this.selectedFile || undefined
        };

        const result = await this.manufacturingService
          .createCustomManufacturing(manufacturingRequest)
          .toPromise();

        this.router.navigate(['/manufacturing/payment', result.id]);
      } catch (error) {
        console.error('Erreur détaillée lors de la soumission:', error);
      } finally {
        this.loading = false;
      }
    }
  }
}
