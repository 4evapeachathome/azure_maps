import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TypesofabusesPageRoutingModule } from './typesofabuses-routing.module';

import { TypesofabusesPage } from './typesofabuses.page';
import { FooterComponent } from "../controls/footer/footer.component";
import { HealthyrelationshipcontentComponent } from "../controls/healthyrelationshipcontent/healthyrelationshipcontent.component";
import { HealthyrelatitonshipComponent } from "../controls/healthyrelatitonship/healthyrelatitonship.component";
import { TypeofabusetitleComponent } from "../controls/typeofabusetitle/typeofabusetitle.component";
import { TypesofAbuseCardComponent } from "../controls/typesof-abuse-card/typesof-abuse-card.component";
import { CriminilizationofsurvivorsComponent } from '../controls/criminilizationofsurvivors/criminilizationofsurvivors.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TypesofabusesPageRoutingModule,
    FooterComponent,
    HealthyrelationshipcontentComponent,
    HealthyrelatitonshipComponent,
    TypeofabusetitleComponent,
    TypesofAbuseCardComponent,
    CriminilizationofsurvivorsComponent
],
  declarations: [TypesofabusesPage]
})
export class TypesofabusesPageModule {}
