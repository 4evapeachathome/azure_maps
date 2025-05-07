import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SripaaPage } from './sripaa.page';

const routes: Routes = [
  {
    path: '',
    component: SripaaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SripaaPageRoutingModule {}
