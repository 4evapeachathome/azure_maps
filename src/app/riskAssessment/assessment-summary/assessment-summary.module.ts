import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AssessmentSummaryPageRoutingModule } from './assessment-summary-routing.module';

import { AssessmentSummaryPage } from './assessment-summary.page';
import { RiskassessmentFooterComponent } from "../controls/riskassessment-footer/riskassessment-footer.component";
import { AssessmentsummaryComponent } from "../controls/assessmentsummary/assessmentsummary.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AssessmentSummaryPageRoutingModule,
    RiskassessmentFooterComponent,
    AssessmentsummaryComponent
],
  declarations: [AssessmentSummaryPage]
})
export class AssessmentSummaryPageModule {}
