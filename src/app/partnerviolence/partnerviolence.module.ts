import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PartnerviolencePageRoutingModule } from './partnerviolence-routing.module';

import { PartnerviolencePage } from './partnerviolence.page';
import { FooterComponent } from "../controls/footer/footer.component";
import { PartnerviolencecontentComponent } from "../controls/partnerviolencecontent/partnerviolencecontent.component";
import { PartnerViolenceProgressbarComponent } from "../controls/partner-violence-progressbar/partner-violence-progressbar.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PartnerviolencePageRoutingModule,
    FooterComponent,
    PartnerviolencecontentComponent,
    PartnerViolenceProgressbarComponent
],
  declarations: [PartnerviolencePage]
})
export class PartnerviolencePageModule {}
