import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LegalrightshomePage } from './legalrightshome.page';

const routes: Routes = [
  {
    path: '',
    component: LegalrightshomePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LegalrightshomePageRoutingModule {}
