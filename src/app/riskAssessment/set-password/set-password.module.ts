import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssessmentResultPageRoutingModule } from './set-password-routing.module';

import { SetPasswordPage } from './set-password.page';
import { RiskassessmentFooterComponent } from "../controls/riskassessment-footer/riskassessment-footer.component";
import { SetPasswordComponent } from "../controls/setpassword/setpassword.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssessmentResultPageRoutingModule,
    RiskassessmentFooterComponent,
    SetPasswordComponent
],
  declarations: [SetPasswordPage]
})
export class AssessmentResultPageModule {}
