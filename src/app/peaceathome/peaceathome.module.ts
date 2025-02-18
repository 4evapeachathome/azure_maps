import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PeaceathomePageRoutingModule } from './peaceathome-routing.module';

import { PeaceathomePage } from './peaceathome.page';
import { PeaceathomeComponent } from "../controls/peaceathome/peaceathome.component";
import { FooterComponent } from "../controls/footer/footer.component";
import { HealthyrelatitonshipComponent } from "../controls/healthyrelatitonship/healthyrelatitonship.component";
import { RelationalComponent } from "../controls/relational/relational.component";
import { HeaderComponent } from "../controls/header/header.component";
import { HomeSliderComponent } from "../controls/home-slider/home-slider.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PeaceathomePageRoutingModule,
    PeaceathomeComponent,
    FooterComponent,
    HealthyrelatitonshipComponent,
    RelationalComponent,
    HeaderComponent,
    HomeSliderComponent
],
  declarations: [PeaceathomePage]
})
export class PeaceathomePageModule {}
