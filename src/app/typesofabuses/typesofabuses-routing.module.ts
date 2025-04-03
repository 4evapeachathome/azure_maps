import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TypesofabusesPage } from './typesofabuses.page';

const routes: Routes = [
  {
    path: '',
    component: TypesofabusesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TypesofabusesPageRoutingModule {}
