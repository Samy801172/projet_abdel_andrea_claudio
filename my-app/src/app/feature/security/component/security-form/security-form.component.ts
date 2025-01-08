import {Component, DestroyRef, inject, Input, signal, WritableSignal} from '@angular/core';
import {CardComponent, FormError} from "../../../../shared";
import { FloatLabelInputComponent } from 'app/shared/ui/form/component/float-label-input/float-label-input.component';
import {FormGroup} from "@angular/forms";
import {FormControlSimpleConfig} from "../../../../shared/ui/form/data/config";
import {handleFormError} from "../../../../shared/ui/form/utils";
import {BehaviorSubject} from "rxjs";
import {JsonPipe, CommonModule } from "@angular/common";


@Component({
  selector: 'app-security-form',
  standalone: true,
  imports: [
    CardComponent,
    FloatLabelInputComponent,
    JsonPipe,
    CommonModule
  ],
  templateUrl: './security-form.component.html',
  styleUrls: ['security-form.component.scss']
})
export class SecurityFormComponent {
  @Input() title: string = 'Connectez-vous';
  @Input({required: true}) formGroup!: FormGroup;
  @Input({required: true}) config!: FormControlSimpleConfig[];
  @Input() icon: string = 'fa-solid fa-unlock';
 protected errors$ : BehaviorSubject<FormError[]> = new BehaviorSubject<FormError[]>([] );
 protected errorsSignal$ : WritableSignal<FormError[]> = signal([] );
 public destroyerRef : DestroyRef = inject(DestroyRef);
  public validateForm(): void {
    console.log('validateForm called');
    if (this.formGroup.invalid) {
      console.log('Form is invalid');
      return;
    }
  }
  ngOnInit(){

    handleFormError(this.formGroup, this.errors$, this.destroyerRef);
}
}
