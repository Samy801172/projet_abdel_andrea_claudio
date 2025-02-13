export interface CustomMedicationResponse {
  id: number;
  description: string;
  instructions?: string;
  estimatedPrice: number;
  prescriptionPath?: string;
  status: 'pending' | 'in_progress' | 'quality_check' | 'completed';
  isPaid: boolean;
  amount: number;
  createdAt: Date;
}

export interface ManufacturingResponse {
  id: number;
  status: 'pending' | 'in_progress' | 'quality_check' | 'completed';
  estimatedCompletionDate?: Date;
  notes?: string;
} 