@Component({
  selector: 'app-manufacturing-pickup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="pickup-verification">
      <h2>Vérification du retrait</h2>
      
      <div class="verification-form">
        <form [formGroup]="pickupForm" (ngSubmit)="verifyPickup()">
          <div class="form-group">
            <label>Code de retrait</label>
            <input type="text" formControlName="pickupCode" placeholder="Entrez le code">
          </div>
          
          <button type="submit" [disabled]="!pickupForm.valid || loading">
            Vérifier
          </button>
        </form>
      </div>

      @if (verificationResult) {
        <div class="result success">
          <i class="fas fa-check-circle"></i>
          <p>Code vérifié avec succès</p>
          <button (click)="confirmPickup()">Confirmer le retrait</button>
        </div>
      }

      @if (verificationError) {
        <div class="result error">
          <i class="fas fa-times-circle"></i>
          <p>Code invalide</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .pickup-verification {
      max-width: 400px;
      margin: 2rem auto;
      padding: 2rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .result {
      margin-top: 2rem;
      padding: 1rem;
      border-radius: 4px;
      text-align: center;

      &.success {
        background: #d4edda;
        color: #155724;
      }

      &.error {
        background: #f8d7da;
        color: #721c24;
      }

      i {
        font-size: 2rem;
        margin-bottom: 1rem;
      }
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background: #0066CC;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;

      &:disabled {
        background: #ccc;
      }
    }
  `]
})
export class ManufacturingPickupComponent {
  @Input() manufacturingId!: number;
  
  pickupForm = new FormGroup({
    pickupCode: new FormControl('', Validators.required)
  });

  verificationResult: boolean = false;
  verificationError: boolean = false;
  loading: boolean = false;

  constructor(
    private manufacturingService: ManufacturingService,
    private notificationService: NotificationService
  ) {}

  verifyPickup() {
    if (this.pickupForm.valid) {
      this.loading = true;
      const code = this.pickupForm.get('pickupCode')?.value;
      
      this.manufacturingService.verifyPickupCode(this.manufacturingId, code)
        .subscribe({
          next: (result) => {
            this.verificationResult = result;
            this.verificationError = !result;
            if (result) {
              this.notificationService.success('Code vérifié avec succès');
            } else {
              this.notificationService.error('Code invalide');
            }
          },
          error: (error) => {
            console.error('Erreur de vérification:', error);
            this.notificationService.error('Erreur lors de la vérification');
            this.verificationError = true;
          },
          complete: () => this.loading = false
        });
    }
  }

  confirmPickup() {
    this.manufacturingService.confirmPickup(this.manufacturingId)
      .subscribe({
        next: () => {
          this.notificationService.success('Retrait confirmé');
        },
        error: (error) => {
          console.error('Erreur de confirmation:', error);
          this.notificationService.error('Erreur lors de la confirmation');
        }
      });
  }
} 