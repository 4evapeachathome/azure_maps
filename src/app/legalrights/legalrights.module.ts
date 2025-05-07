import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LegalrightsPageRoutingModule } from './legalrights-routing.module';

import { LegalrightsPage } from './legalrights.page';
import { HeaderComponent } from "../controls/header/header.component";
import { FooterComponent } from "../controls/footer/footer.component";
import { UsaMapComponent } from "../usa-map/usa-map.component";
import { BreadcrumbComponent } from "../controls/breadcrumb/breadcrumb.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LegalrightsPageRoutingModule,
    HeaderComponent,
    FooterComponent,
    UsaMapComponent,
    BreadcrumbComponent
],
  declarations: [LegalrightsPage]
})
export class LegalrightsPageModule {}
