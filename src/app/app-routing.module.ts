import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { PeaceathomeComponent } from './controls/peaceathome/peaceathome.component';
import { SupportserviceComponent } from './controls/supportservice/supportservice.component';
import { ContactUsFormComponent } from './controls/contact-us-form/contact-us-form.component';
import { RelationalComponent } from './controls/relational/relational.component';
import { TypesofAbuseCardComponent } from './controls/typesof-abuse-card/typesof-abuse-card.component';
import { HealthyrelatitonshipComponent } from './controls/healthyrelatitonship/healthyrelatitonship.component';


const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  { path: 'peaceathome', component: PeaceathomeComponent },
  { path: 'supportservice', component: SupportserviceComponent },
  { path: 'contactus', component: ContactUsFormComponent },
  { path: 'relational', component: RelationalComponent },
  { path: 'typesofabuse', component: TypesofAbuseCardComponent },
  { path: 'healthyrelationship', component: HealthyrelatitonshipComponent },
  
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
