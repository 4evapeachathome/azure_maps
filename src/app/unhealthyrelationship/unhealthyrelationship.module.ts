import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UnhealthyrelationshipPageRoutingModule } from './unhealthyrelationship-routing.module';

import { UnhealthyrelationshipPage } from './unhealthyrelationship.page';
import { FooterComponent } from "../controls/footer/footer.component";
import { HeaderComponent } from "../controls/header/header.component";
import { HealthyrelatitonshipComponent } from "../controls/healthyrelatitonship/healthyrelatitonship.component";
import { HomeSliderComponent } from "../controls/home-slider/home-slider.component";
import { UnhealthyRelationshipContent } from "../controls/unhealthyrelationship-contents/unhealthyrelationshipcontent";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UnhealthyrelationshipPageRoutingModule,
    FooterComponent,
    HeaderComponent,
    HealthyrelatitonshipComponent,
    HomeSliderComponent,
    UnhealthyRelationshipContent
],
  declarations: [UnhealthyrelationshipPage]
})
export class UnhealthyrelationshipPageModule {}
