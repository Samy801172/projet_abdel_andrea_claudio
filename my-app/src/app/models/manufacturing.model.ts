export interface MedicationComponent {
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  basePrice: number;
}

export interface ManufacturingRequest {
  notes?: string;
  components: MedicationComponent[];
  totalAmount: number;
  depositAmount: number;
  prescription?: File;
} 