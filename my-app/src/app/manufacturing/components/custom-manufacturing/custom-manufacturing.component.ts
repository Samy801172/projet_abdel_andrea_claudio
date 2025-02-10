import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ManufacturingService } from '../../services/manufacturing.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-custom-manufacturing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './custom-manufacturing.component.html',
  styleUrls: ['./custom-manufacturing.component.scss']
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

  // ... reste du code inchangé
} 