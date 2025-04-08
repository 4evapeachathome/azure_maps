import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { LegalrightshomePageRoutingModule } from './legalrightshome-routing.module';

import { LegalrightshomePage } from './legalrightshome.page';
import { FooterComponent } from "../controls/footer/footer.component";
import { LegalrightsComponent } from "../controls/legalrights/legalrights.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LegalrightshomePageRoutingModule,
    FooterComponent,
    LegalrightsComponent
],
  declarations: [LegalrightshomePage]
})
export class LegalrightshomePageModule {}
