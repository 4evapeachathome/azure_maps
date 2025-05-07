import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HealthyrelationshipPage } from './healthyrelationship.page';

const routes: Routes = [
  {
    path: '',
    component: HealthyrelationshipPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HealthyrelationshipPageRoutingModule {}
