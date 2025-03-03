import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { RelationalComponent } from './controls/relational/relational.component';
import { TypesofAbuseCardComponent } from './controls/typesof-abuse-card/typesof-abuse-card.component';
import { HealthyrelatitonshipComponent } from './controls/healthyrelatitonship/healthyrelatitonship.component';
import { UsStateLawDetailsComponent  } from './controls/us-state-law-details/us-state-law-details.component';
import { UsaMapComponent } from './usa-map/usa-map.component';


const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  { path: 'peaceathome', 
    loadChildren: () => import('./peaceathome/peaceathome.module').then( m => m.PeaceathomePageModule)
  },
  { path: 'healthyrelationship', 
    loadChildren: () => import('./healthyrelationship/healthyrelationship.module').then( m => m.HealthyrelationshipPageModule)
  },
  { path: 'nopeaceathome', 
    loadChildren: () => import('./nopeaceathome/nopeaceathome.module').then( m => m.NopeaceathomePageModule)
  },
  { path: 'relational', component: RelationalComponent },
  { path: 'typesofabuse', component: TypesofAbuseCardComponent },
  { path: 'uslawsbystate', component: UsaMapComponent },
  { path: 'us-state-law-details/:stateName', component: UsStateLawDetailsComponent },
    
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'contactus',
    loadChildren: () => import('./contactus/contactus.module').then( m => m.ContactusPageModule)
  },
  {
    path: 'supportservice',
    loadChildren: () => import('./supportservice/supportservice.module').then( m => m.SupportservicePageModule)
  },  {
    path: 'unhealthyrelationship',
    loadChildren: () => import('./unhealthyrelationship/unhealthyrelationship.module').then( m => m.UnhealthyrelationshipPageModule)
  }

];

@NgModule({
  imports: [ 
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
