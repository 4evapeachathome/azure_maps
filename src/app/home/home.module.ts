import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';
import { DailyTipsComponent } from '../controls/daily-tips/daily-tips.component';

import { HomePageRoutingModule } from './home-routing.module';
import { HappyHomeComponent } from '../controls/happy-home/happy-home.component';
import { PeaceHarmonyComponent } from '../controls/peace-harmony/peace-harmony.component';
import { HomeSliderComponent } from '../controls/home-slider/home-slider.component';
import { WellnessTipsComponent } from '../controls/wellness-tips/wellness-tips.component';
import { ContactUsFormComponent } from '../controls/contact-us-form/contact-us-form.component';
import { FooterComponent } from "../controls/footer/footer.component";
import { PeaceathomeComponent } from "../controls/peaceathome/peaceathome.component";
import { HealthyrelatitonshipComponent } from "../controls/healthyrelatitonship/healthyrelatitonship.component";
import { BrowserModule } from '@angular/platform-browser';
import { SupportserviceComponent } from '../controls/supportservice/supportservice.component';
import { PartnerViolenceProgressbarComponent } from "../controls/partner-violence-progressbar/partner-violence-progressbar.component";
import { TypesofAbuseCardComponent } from "../controls/typesof-abuse-card/typesof-abuse-card.component";
import { RelationalComponent } from '../controls/relational/relational.component';
import { UsaMapComponent } from '../usa-map/usa-map.component';
import { HeaderComponent } from "../controls/header/header.component";
import { NopeacehomescenariooneComponent } from "../controls/nopeacehome-scenario-one/nopeacehomescenarioone.component";
import { BreadcrumbComponent } from "../controls/breadcrumb/breadcrumb.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    DailyTipsComponent,
    HappyHomeComponent,
    PeaceHarmonyComponent,
    HomeSliderComponent,
    WellnessTipsComponent,
    ContactUsFormComponent,
    FooterComponent,
    PeaceathomeComponent,
    HealthyrelatitonshipComponent,
    SupportserviceComponent,
    PartnerViolenceProgressbarComponent,
    TypesofAbuseCardComponent,
    UsaMapComponent,
    RelationalComponent,
    HeaderComponent,
    NopeacehomescenariooneComponent,
    BreadcrumbComponent
],
  declarations: [
    HomePage
  ]
})
export class HomePageModule {}
