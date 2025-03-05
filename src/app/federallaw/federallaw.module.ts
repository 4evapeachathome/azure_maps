import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FederallawPageRoutingModule } from './federallaw-routing.module';

import { FederallawPage } from './federallaw.page';
import { HeaderComponent } from "../controls/header/header.component";
import { FooterComponent } from "../controls/footer/footer.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FederallawPageRoutingModule,
    HeaderComponent,
    FooterComponent
],
  declarations: [FederallawPage]
})
export class FederallawPageModule {}
