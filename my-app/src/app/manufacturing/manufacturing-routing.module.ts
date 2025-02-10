import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomManufacturingComponent } from './components/custom-manufacturing/custom-manufacturing.component';
import { AuthGuard } from '../feature/Dashboard/guard/auth.guard';

const routes: Routes = [
  {
    path: 'manufacturing',
    children: [
      {
        path: 'custom',
        component: CustomManufacturingComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManufacturingRoutingModule { } 