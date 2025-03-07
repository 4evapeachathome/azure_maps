import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'peaceathome', loadChildren: () => import('./peaceathome/peaceathome.module').then(m => m.PeaceathomePageModule) },
  { path: 'healthyrelationship', loadChildren: () => import('./healthyrelationship/healthyrelationship.module').then(m => m.HealthyrelationshipPageModule) },
  { path: 'nopeaceathome', loadChildren: () => import('./nopeaceathome/nopeaceathome.module').then(m => m.NopeaceathomePageModule) },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'contactus', loadChildren: () => import('./contactus/contactus.module').then(m => m.ContactusPageModule) },
  { path: 'supportservice', loadChildren: () => import('./supportservice/supportservice.module').then(m => m.SupportservicePageModule) },
  { path: 'unhealthyrelationship', loadChildren: () => import('./unhealthyrelationship/unhealthyrelationship.module').then(m => m.UnhealthyrelationshipPageModule) },
  { path: 'uslawsbystate', loadChildren: () => import('./legalrights/legalrights.module').then(m => m.LegalrightsPageModule) },
  { path: 'federallaw', loadChildren: () => import('./federallaw/federallaw.module').then(m => m.FederallawPageModule) }
];

@NgModule({
  imports: [ 
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }