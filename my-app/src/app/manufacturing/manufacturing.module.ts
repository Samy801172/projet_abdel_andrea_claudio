import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CustomManufacturingComponent } from './components/custom-manufacturing/custom-manufacturing.component';
import { ManufacturingRoutingModule } from './manufacturing-routing.module';
import { ManufacturingService } from './services/manufacturing.service';

@NgModule({
  declarations: [
    CustomManufacturingComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ManufacturingRoutingModule
  ],
  providers: [ManufacturingService]
})
export class ManufacturingModule { } 