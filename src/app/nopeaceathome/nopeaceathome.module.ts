import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NopeaceathomePageRoutingModule } from './nopeaceathome-routing.module';

import { NopeaceathomePage } from './nopeaceathome.page';
import { HeaderComponent } from "../controls/header/header.component";
import { HomeSliderComponent } from "../controls/home-slider/home-slider.component";
import { HealthyrelatitonshipComponent } from "../controls/healthyrelatitonship/healthyrelatitonship.component";
import { HealthyrelationshipcontentComponent } from "../controls/healthyrelationshipcontent/healthyrelationshipcontent.component";
import { FooterComponent } from "../controls/footer/footer.component";
import { UnhealthyRelationshipContent } from "../controls/unhealthyrelationship-contents/unhealthyrelationshipcontent";
import { UnhealthyrelationexampleComponent } from "../controls/unhealthyrelationexample/unhealthyrelationexample.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NopeaceathomePageRoutingModule,
    HeaderComponent,
    HomeSliderComponent,
    HealthyrelatitonshipComponent,
    HealthyrelationshipcontentComponent,
    FooterComponent,
    UnhealthyRelationshipContent,
    UnhealthyrelationexampleComponent
],
  declarations: [NopeaceathomePage]
})
export class NopeaceathomePageModule {}
