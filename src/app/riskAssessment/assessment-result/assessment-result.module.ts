import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssessmentResultPageRoutingModule } from './assessment-result-routing.module';

import { AssessmentResultPage } from './assessment-result.page';
import { RiskassessmentFooterComponent } from "../controls/riskassessment-footer/riskassessment-footer.component";
import { AssessmentresultComponent } from "../controls/assessmentresult/assessmentresult.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssessmentResultPageRoutingModule,
    RiskassessmentFooterComponent,
    AssessmentresultComponent
],
  declarations: [AssessmentResultPage]
})
export class AssessmentResultPageModule {}
