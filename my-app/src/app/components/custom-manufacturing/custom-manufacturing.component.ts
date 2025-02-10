import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ManufacturingService } from '../../services/manufacturing/manufacturing.service';
import { Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-custom-manufacturing',
  templateUrl: './custom-manufacturing.component.html',
  styleUrls: ['./custom-manufacturing.component.scss'],
  providers: [CurrencyPipe]
})
export class CustomManufacturingComponent implements OnInit {
  manufacturingForm: FormGroup;
  selectedFile: File | null = null;
  loading = false;
  composition = [
    { name: 'Amoxicilline', quantity: 500, unit: 'mg', pricePerUnit: 0.5 },
    { name: 'Codéine', quantity: 30, unit: 'mg', pricePerUnit: 0.8 }
  ];

  constructor(
    private fb: FormBuilder,
    private manufacturingService: ManufacturingService,
    private router: Router
  ) {
    this.manufacturingForm = this.fb.group({
      prescription: ['', Validators.required],
      notes: [''],
    });
  }

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.manufacturingForm.valid && this.selectedFile) {
      this.loading = true;
      try {
        const formData = new FormData();
        formData.append('prescription', this.selectedFile);
        formData.append('notes', this.manufacturingForm.get('notes')?.value);
        formData.append('composition', JSON.stringify(this.composition));

        const result = await this.manufacturingService.createCustomManufacturing(formData).toPromise();
        this.router.navigate(['/manufacturing/payment', result.id]);
      } catch (error) {
        console.error('Erreur lors de la soumission:', error);
      } finally {
        this.loading = false;
      }
    }
  }

  calculateTotal(): number {
    return this.composition.reduce((total, item) => 
      total + (item.quantity * item.pricePerUnit), 0);
  }

  calculateDeposit(): number {
    return this.calculateTotal() * 0.3; // 30% d'acompte
  }
} 