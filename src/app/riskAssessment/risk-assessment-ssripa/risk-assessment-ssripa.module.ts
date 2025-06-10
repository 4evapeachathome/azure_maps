import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RiskAssessmentSSripaPageRoutingModule } from './risk-assessment-ssripa-routing.module';

import { RiskAssessmentSSripaPage } from './risk-assessment-ssripa.page';
import { RiskassessmentFooterComponent } from '../controls/riskassessment-footer/riskassessment-footer.component';
import { RiskassessmentSSripaComponent } from '../controls/riskassessment-ssripa/riskassessment-ssripa.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RiskassessmentFooterComponent,
    RiskassessmentSSripaComponent,
    RiskAssessmentSSripaPageRoutingModule
  ],
  declarations: [RiskAssessmentSSripaPage]
})
export class RiskAssessmentSSripaPageModule {}
