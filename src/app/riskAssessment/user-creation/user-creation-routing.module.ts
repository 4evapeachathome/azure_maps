import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { UserCreationPage } from './user-creation.page';

const routes: Routes = [
  {
    path: '',
    component: UserCreationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssessmentResultPageRoutingModule {}
