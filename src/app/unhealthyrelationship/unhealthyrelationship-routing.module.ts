import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UnhealthyrelationshipPage } from './unhealthyrelationship.page';

const routes: Routes = [
  {
    path: '',
    component: UnhealthyrelationshipPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UnhealthyrelationshipPageRoutingModule {}
