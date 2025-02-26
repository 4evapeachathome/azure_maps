import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SupportservicePage } from './supportservice.page';

const routes: Routes = [
  {
    path: '',
    component: SupportservicePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupportservicePageRoutingModule {}
