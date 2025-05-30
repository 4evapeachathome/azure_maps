import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssessmentPagePageRoutingModule } from './assessment-page-routing.module';

import { AssessmentPagePage } from './assessment-page.page';
import { RiskassessmentFooterComponent } from "../controls/riskassessment-footer/riskassessment-footer.component";
import { AssessmentPageComponent } from "../controls/assessment-page/assessment-page.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssessmentPagePageRoutingModule,
    RiskassessmentFooterComponent,
    AssessmentPageComponent
],
  declarations: [AssessmentPagePage]
})
export class AssessmentPagePageModule {}
