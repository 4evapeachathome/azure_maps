import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { HitsAssessmentPagePageRoutingModule } from './hits-assessment-page-routing.module';

import { HitsAssessmentPagePage } from './hits-assessment-page.page';
import { RiskassessmentFooterComponent } from '../controls/riskassessment-footer/riskassessment-footer.component';
import { HitsassessmentComponent } from '../controls/hitsassessment/hitsassessment.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HitsassessmentComponent,
    RiskassessmentFooterComponent,
    IonicModule,
    HitsAssessmentPagePageRoutingModule
  ],
  declarations: [HitsAssessmentPagePage]
})
export class HitsAssessmentPagePageModule {}
