import { Routes } from '@angular/router';
import { CustomManufacturingComponent } from './custom-manufacturing.component';
import { ManufacturingPaymentComponent } from './manufacturing-payment.component';

export const manufacturingRoutes: Routes = [
  {
    path: 'custom',
    component: CustomManufacturingComponent
  },
  {
    path: ':id/payment',
    component: ManufacturingPaymentComponent
  }
]; 