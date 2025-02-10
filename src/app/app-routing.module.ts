import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { PeaceathomeComponent } from './controls/peaceathome/peaceathome.component';
import { SupportserviceComponent } from './controls/supportservice/supportservice.component';
import { ContactUsFormComponent } from './controls/contact-us-form/contact-us-form.component';
import { RelationalComponent } from './controls/relational/relational.component';
import { TypesofAbuseCardComponent } from './controls/typesof-abuse-card/typesof-abuse-card.component';
import { HealthyrelatitonshipComponent } from './controls/healthyrelatitonship/healthyrelatitonship.component';
import { UsMapComponent } from './controls/us-map/us-map.component';
import { UsStateLawDetailsComponent  } from './controls/us-state-law-details/us-state-law-details.component';


const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  { path: 'peaceathome', 
    loadChildren: () => import('./peaceathome/peaceathome.module').then( m => m.PeaceathomePageModule)
  },
  { path: 'supportservice', component: SupportserviceComponent },
  { path: 'contactus', component: ContactUsFormComponent },
  { path: 'relational', component: RelationalComponent },
  { path: 'typesofabuse', component: TypesofAbuseCardComponent },
  { path: 'healthyrelationship', component: HealthyrelatitonshipComponent },
  { path: 'uslawsbystate', component: UsMapComponent },
  { path: 'us-state-law-details/:stateName', component: UsStateLawDetailsComponent },
    
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'peaceathome',
    loadChildren: () => import('./peaceathome/peaceathome.module').then( m => m.PeaceathomePageModule)
  },

];

@NgModule({
  imports: [ 
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
