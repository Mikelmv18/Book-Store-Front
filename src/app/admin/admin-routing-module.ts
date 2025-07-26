import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderManagementComponent } from './order-management/order-management';
import { adminGuard } from '../guards/admin-guard';

const routes: Routes = [
  {
    path: '',
    component: OrderManagementComponent,
    canActivate: [adminGuard]  // Protect the admin route with your guard
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
