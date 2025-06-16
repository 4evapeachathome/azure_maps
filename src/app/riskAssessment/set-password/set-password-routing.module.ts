import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SetPasswordPage } from './set-password.page';
import { onBoardingResolver } from './on-boarding.resolver';

const routes: Routes = [
  {
    path: '',
    component: SetPasswordPage,
    resolve: {
      flowType: onBoardingResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssessmentResultPageRoutingModule {}
